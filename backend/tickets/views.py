from django.shortcuts import render

from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

from django.db import models
from .models import Category, Ticket, Comment
from .serializers import CategorySerializer, TicketSerializer, CommentSerializer

class CategoryViewSet(ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class TicketViewSet(ModelViewSet):
    serializer_class = TicketSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.is_superuser or getattr(user, "role", None) == "ADMIN":
            return Ticket.objects.all()
        
        if getattr(user, 'role', None) == 'AGENT':
            return Ticket.objects.filter(models.Q(assigned_to__isnull=True) | models.Q(assigned_to=user))
        
        return Ticket.objects.filter(created_by=user)
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def assign_to_me(self, request, pk=None):
        ticket = self.get_object()
        user = request.user

        role = getattr(user, 'role', None)
        if not (user.is_superuser or role in ['AGENT', 'ADMIN']):
            return Response({"detail": "Only agents can assign tickets."}, status=status.HTTP_403_FORBIDDEN)
        
        if ticket.assigned_to is not None and ticket.assigned_to != user:
            return Response({"detail": "Ticket is already assigned."}, status=status.HTTP_400_BAD_REQUEST)
        
        ticket.assigned_to = user

        if ticket.status == Ticket.Status.OPEN:
            ticket.status = Ticket.Status.IN_PROGRESS

        ticket.save(update_fields=['assigned_to', 'status', 'updated_at'])
        return Response(self.get_serializer(ticket).data, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['POST'])
    def change_status(self, request, pk=None):
        ticket = self.get_object()
        user = request.user
        new_status = request.data.get('status')

        if new_status not in Ticket.Status.values:
            return Response({"detail": "Invalid status."}, status=status.HTTP_400_BAD_REQUEST)
        
        role = getattr(user, 'role', None)
        is_admin_like = user.is_superuser or role == 'ADMIN'
        is_agent = role == 'AGENT'
        is_client_owner = role == 'CLIENT' and ticket.created_by_id == user.id

        allower_transitions = {
            Ticket.Status.OPEN: {Ticket.Status.IN_PROGRESS, Ticket.Status.CLOSED},
            Ticket.Status.IN_PROGRESS: {Ticket.Status.RESOLVED, Ticket.Status.CLOSED},
            Ticket.Status.RESOLVED: {Ticket.Status.CLOSED, Ticket.Status.IN_PROGRESS},
            Ticket.Status.CLOSED: set(),
        }

        if new_status not in allower_transitions[ticket.status]:
            return Response({"detail": "Invalid status transition."}, status=status.HTTP_400_BAD_REQUEST)
        
        if is_client_owner:
            if new_status != Ticket.Status.CLOSED:
                return Response({"detail": "Clients can only close their own tickets."}, status=status.HTTP_403_FORBIDDEN)
        elif not (is_agent or is_admin_like):
            return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)  
        
        ticket.status = new_status
        ticket.save(update_fields = ['status', 'updated_at'])
        return Response(self.get_serializer(ticket).data, status = status.HTTP_200_OK)
    
    @action(detail=True, methods=["get", "post"], url_path="comments")
    def comments(self, request, pk=None):
        ticket = self.get_object()
        user = request.user

        if request.method.lower() == "get":
            qs = ticket.comments.select_related("author").order_by("created_at")
            serializer = CommentSerializer(qs, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        #POST
        body = (request.data.get("body") or "").strip()
        if not body:
            return Response({"detail": "Comment cannot be empty."}, status=status.HTTP_400_BAD_REQUEST)
        
        comment = Comment.objects.create(
            ticket=ticket,
            author=user,
            body=body,
        )
        serializer = CommentSerializer(comment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
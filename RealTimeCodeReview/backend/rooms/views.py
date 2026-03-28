from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.conf import settings
import requests

from .models import Room, RoomMember, CodeSnippet
from .serializers import RoomSerializer, RoomMemberSerializer

class RoomCreateView(generics.CreateAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        room = serializer.save(created_by=self.request.user)
        # Add creator as Author
        RoomMember.objects.create(user=self.request.user, room=room, role='AUTHOR')
        # Initialize snippet
        CodeSnippet.objects.create(room=room, content="// Start coding here\n", language="javascript")

class RoomDetailView(generics.RetrieveAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = [permissions.IsAuthenticated]

class JoinRoomView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        room = get_object_or_404(Room, pk=pk)
        member, created = RoomMember.objects.get_or_create(
            user=request.user,
            room=room,
            defaults={'role': 'REVIEWER'}
        )
        if created:
            return Response({"detail": "Joined room successfully."}, status=status.HTTP_201_CREATED)
        return Response({"detail": "Already a member of this room."}, status=status.HTTP_200_OK)


class ExecuteCodeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        room = get_object_or_404(Room, pk=pk)
        code = room.code_snippet.content
        language = room.code_snippet.language

        language_map = {
            'javascript': 63,
            'python': 71,
            'java': 62,
            'cpp': 54,
        }
        
        lang_id = language_map.get(language)
        if not lang_id:
            return Response({"error": f"Language {language} not supported for execution."}, status=400)

        url = "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true"
        payload = {
            "source_code": code,
            "language_id": lang_id
        }
        headers = {
            "content-type": "application/json",
            "X-RapidAPI-Key": settings.JUDGE0_API_KEY,
            "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
        }

        try:
            response = requests.post(url, json=payload, headers=headers)
            result = response.json()
            output = result.get('stdout') or result.get('stderr') or result.get('compile_output') or result.get('message')
            return Response({"output": output})
        except Exception as e:
            return Response({"error": str(e)}, status=500)


class GitHubImportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        room = get_object_or_404(Room, pk=pk)
        repo_url = request.data.get('repo_url')
        if not repo_url:
            return Response({"error": "repo_url is required."}, status=400)
            
        try:
            # Transform standard github URL to raw if needed
            if "github.com" in repo_url and "/blob/" in repo_url:
                repo_url = repo_url.replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/")

            response = requests.get(repo_url)
            if response.status_code == 200:
                room.code_snippet.content = response.text
                if repo_url.endswith('.js'): room.code_snippet.language = 'javascript'
                elif repo_url.endswith('.py'): room.code_snippet.language = 'python'
                elif repo_url.endswith('.java'): room.code_snippet.language = 'java'
                elif repo_url.endswith('.cpp' ) or repo_url.endswith('.c'): room.code_snippet.language = 'cpp'
                room.code_snippet.save()
                return Response({
                    "message": "Code imported successfully.", 
                    "content": room.code_snippet.content, 
                    "language": room.code_snippet.language
                })
            else:
                return Response({"error": "Failed to fetch from GitHub URL."}, status=response.status_code)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

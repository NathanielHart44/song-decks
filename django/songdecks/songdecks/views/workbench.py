from songdecks.models import (
    Profile, Tag, Proposal, ProposalImage, Task, SubTask
)
from songdecks.serializers import (
    TagSerializer, ProposalSerializer,
    ProposalImageSerializer, TaskSerializer,
    ProfileSerializer, SubTaskSerializer
)
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)

# ----------------------------------------------------------------------

@api_view(['GET'])
def get_all_moderators(request):
    if not request.user.profile.moderator:
        return Response(
            {"detail": "You are not authorized to view moderators."},
            status=status.HTTP_403_FORBIDDEN
        )
    moderators = Profile.objects.filter(moderator=True)
    serializer = ProfileSerializer(moderators, many=True)
    return Response(serializer.data)

# ----------------------------------------------------------------------
# Tags

@api_view(['GET'])
def get_all_tags(request):
    tags = Tag.objects.all()
    serializer = TagSerializer(tags, many=True)
    return Response(serializer.data)
    
@api_view(['POST'])
def create_tag(request):
    if not request.user.profile.moderator:
        return Response(
            {"detail": "You are not authorized to create tags."},
            status=status.HTTP_403_FORBIDDEN
        )
    try:
        serializer = TagSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(
                {"detail": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
    except Exception as e:
        return Response(
            {"detail": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
@api_view(['POST'])
def update_tag(request, tag_id):
    if not request.user.profile.moderator:
        return Response(
            {"detail": "You are not authorized to update tags."},
            status=status.HTTP_403_FORBIDDEN
        )
    try:
        tag = Tag.objects.get(pk=tag_id)
        serializer = TagSerializer(tag, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(
                {"detail": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
    except Tag.DoesNotExist:
        return Response(
            {"detail": "Tag not found."},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"detail": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['DELETE'])
def delete_tag(request, tag_id):
    if not request.user.profile.moderator:
        return Response(
            {"detail": "You are not authorized to delete tags."},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        tag = Tag.objects.get(pk=tag_id)
        tag.delete()
        return Response(
            {"detail": "Tag deleted successfully."},
            status=status.HTTP_200_OK
        )
    except Tag.DoesNotExist:
        return Response(
            {"detail": "Tag not found."},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"detail": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# ----------------------------------------------------------------------
# Proposals
    
@api_view(['GET'])
def get_all_proposals(request):
    proposals = Proposal.objects.all()
    if request.user.profile.moderator == False:
        proposals = proposals.filter(is_private=False)
    serializer = ProposalSerializer(proposals, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def create_proposal(request):
    try:
        request_data = request.data.copy()
        request_data['creator'] = request.user.profile.id

        serializer = ProposalSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response(
            {"detail": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def get_proposal(request, proposal_id):
    try:
        proposal = Proposal.objects.get(pk=proposal_id)
    except Proposal.DoesNotExist:
        return Response({"detail": "Proposal not found."}, status=status.HTTP_404_NOT_FOUND)
    serializer = ProposalSerializer(proposal)
    return Response(serializer.data)

@api_view(['POST'])
def update_proposal(request, proposal_id):
    try:
        proposal = Proposal.objects.get(pk=proposal_id)
        if (not request.user.profile.moderator) and proposal.creator != request.user.profile:
            return Response(
                {"detail": "You are not authorized to update this proposal."},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = ProposalSerializer(proposal, data=request.data, context={'request': request}, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Proposal.DoesNotExist:
        return Response({"detail": "Proposal not found."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response(
            {"detail": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['DELETE'])
def delete_proposal(request, proposal_id):
    try:
        if not request.user.profile.moderator:
            return Response(
                {"detail": "You are not authorized to delete proposals."},
                status=status.HTTP_403_FORBIDDEN
            )
        proposal = Proposal.objects.get(pk=proposal_id)
        proposal.delete()
        return Response({"detail": "Proposal deleted successfully."}, status=status.HTTP_200_OK)
    except Proposal.DoesNotExist:
        return Response({"detail": "Proposal not found."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response(
            {"detail": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def handle_favorite_proposal(request, proposal_id):
    try:
        proposal = Proposal.objects.get(pk=proposal_id)
        if request.user.profile in proposal.favorited_by.all():
            proposal.favorited_by.remove(request.user.profile)
        else:
            proposal.favorited_by.add(request.user.profile)
        proposal.save()
        serializer = ProposalSerializer(proposal)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Proposal.DoesNotExist:
        return Response({"detail": "Proposal not found."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response(
            {"detail": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# ----------------------------------------------------------------------
# Tasks

@api_view(['GET'])
def get_all_tasks(request):
    tasks = Task.objects.all()
    if request.user.profile.moderator == False:
        tasks = tasks.filter(is_private=False)
    serializer = TaskSerializer(tasks, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def create_task(request):
    if not request.user.profile.moderator:
        return Response(
            {"detail": "You are not authorized to create tasks."},
            status=status.HTTP_403_FORBIDDEN
        )
    serializer = TaskSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_task(request, task_id):
    try:
        task = Task.objects.get(pk=task_id)
        if not request.user.profile.moderator and task.is_private:
            return Response(
                {"detail": "You are not authorized to view this task."},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = TaskSerializer(task)
        return Response(serializer.data)
    except Task.DoesNotExist:
        return Response({"detail": "Task not found."}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
def update_task(request, task_id):
    if not request.user.profile.moderator:
        return Response(
            {"detail": "You are not authorized to update tasks."},
            status=status.HTTP_403_FORBIDDEN
        )
    try:
        task = Task.objects.get(pk=task_id)
    except Task.DoesNotExist:
        return Response({"detail": "Task not found."}, status=status.HTTP_404_NOT_FOUND)

    serializer = TaskSerializer(task, data=request.data, context={'request': request}, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def delete_task(request, task_id):
    if not request.user.profile.moderator:
        return Response(
            {"detail": "You are not authorized to delete tasks."},
            status=status.HTTP_403_FORBIDDEN
        )
    try:
        task = Task.objects.get(pk=task_id)
        task.delete()
        return Response({"detail": "Task deleted successfully."}, status=status.HTTP_200_OK)
    except Task.DoesNotExist:
        return Response({"detail": "Task not found."}, status=status.HTTP_404_NOT_FOUND)
    
@api_view(['POST'])
def handle_favorite_task(request, task_id):
    try:
        task = Task.objects.get(pk=task_id)
        if request.user.profile in task.favorited_by.all():
            task.favorited_by.remove(request.user.profile)
        else:
            task.favorited_by.add(request.user.profile)
        task.save()
        serializer = TaskSerializer(task)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Task.DoesNotExist:
        return Response({"detail": "Task not found."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response(
            {"detail": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
# ----------------------------------------------------------------------
# SubTasks
    
@api_view(['POST'])
def create_subtask(request):
    try:
        if not request.user.profile.moderator:
            return Response(
                {"detail": "You are not authorized to create subtasks."},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = SubTaskSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            task = Task.objects.get(pk=request.data['task'])
            task_serializer = TaskSerializer(task)
            return Response(task_serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response(
            {"detail": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def update_subtask(request, subtask_id):
    try:
        if not request.user.profile.moderator:
            return Response(
                {"detail": "You are not authorized to update subtasks."},
                status=status.HTTP_403_FORBIDDEN
            )
        try:
            subtask = SubTask.objects.get(pk=subtask_id)
        except SubTask.DoesNotExist:
            return Response({"detail": "SubTask not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = SubTaskSerializer(subtask, data=request.data, context={'request': request}, partial=True)
        if serializer.is_valid():
            serializer.save()
            task = Task.objects.get(pk=request.data['task'])
            task_serializer = TaskSerializer(task)
            return Response(task_serializer.data)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response(
            {"detail": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
@api_view(['DELETE'])
def delete_subtask(request, subtask_id):
    try:
        if not request.user.profile.moderator:
            return Response(
                {"detail": "You are not authorized to delete subtasks."},
                status=status.HTTP_403_FORBIDDEN
            )
        try:
            subtask = SubTask.objects.get(pk=subtask_id)
            subtask.delete()
            return Response({"detail": "SubTask deleted successfully."}, status=status.HTTP_200_OK)
        except SubTask.DoesNotExist:
            return Response({"detail": "SubTask not found."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response(
            {"detail": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
# ----------------------------------------------------------------------
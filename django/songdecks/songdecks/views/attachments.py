from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from songdecks.serializers import AttachmentSerializer  # Ensure you have this serializer
from songdecks.models import Faction, Attachment
from songdecks.views.helpers import upload_file_to_s3
from songdecks.settings import AWS_S3_BUCKET_NAME

# ----------------------------------------------------------------------
# Attachment Content

@api_view(['GET'])
def get_attachments(request):
    try:
        attachments = Attachment.objects.all()
        serializer = AttachmentSerializer(attachments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def add_edit_attachment(request, attachment_id=None):
    try:
        if not request.user.profile.moderator:
            return Response({"detail": "You do not have permission to edit attachments."}, status=status.HTTP_403_FORBIDDEN)

        info = {
            'name': request.data.get('name'),
            'points_cost': request.data.get('points_cost'),
            'img_url': request.data.get('img_url'),
            'main_url': request.data.get('main_url'),
            'faction_id': request.data.get('faction_id'),
        }

        # Validate required fields
        for key, value in info.items():
            if value is None:
                return Response({"detail": f"Missing {key}"}, status=status.HTTP_400_BAD_REQUEST)

        # Handle image file upload
        img_file = request.data.get('img_file')
        if img_file:
            is_success, error_msg = upload_file_to_s3(img_file, AWS_S3_BUCKET_NAME, info['img_url'])
            if not is_success:
                return Response({"detail": error_msg}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Handle main file upload
        main_file = request.data.get('main_file')
        if main_file:
            is_success, error_msg = upload_file_to_s3(main_file, AWS_S3_BUCKET_NAME, info['main_url'])
            if not is_success:
                return Response({"detail": error_msg}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Check if faction exists
        faction = Faction.objects.filter(id=info['faction_id']).first()
        if not faction:
            return Response({"detail": "Faction not found."}, status=status.HTTP_400_BAD_REQUEST)

        # Create or update Attachment
        if attachment_id is None:
            attachment = Attachment.objects.create(
                name=info['name'],
                points_cost=info['points_cost'],
                img_url=info['img_url'],
                main_url=info['main_url'],
                faction=faction,
            )
        else:
            attachment = Attachment.objects.filter(id=attachment_id).first()
            if not attachment:
                return Response({"detail": "Attachment not found."}, status=status.HTTP_404_NOT_FOUND)
            attachment.name = info['name']
            attachment.points_cost = info['points_cost']
            attachment.img_url = info['img_url']
            attachment.main_url = info['main_url']
            attachment.faction = faction
            attachment.save()

        serializer = AttachmentSerializer(attachment)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
def delete_attachment(request, attachment_id):
    try:
        if not request.user.profile.moderator:
            return Response({"detail": "You do not have permission to delete attachments."}, status=status.HTTP_403_FORBIDDEN)

        attachment = Attachment.objects.filter(id=attachment_id).first()
        if not attachment:
            return Response({"detail": "Attachment not found."}, status=status.HTTP_404_NOT_FOUND)
        
        attachment.delete()
        return Response({"detail": f"Successfully deleted: {attachment.name}"}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
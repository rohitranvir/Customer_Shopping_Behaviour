"""
Serializers — convert model instances ↔ JSON.

Public serializers: minimal fields for the React frontend.
Admin serializers: all fields + write support.
"""
from rest_framework import serializers
from .models import Project, Skill, Experience, Certification, Message, SiteSettings


# ─────────────────────────────────────────────────────────────────────────────
# PROJECT
# ─────────────────────────────────────────────────────────────────────────────
class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = [
            'id', 'title', 'description', 'short_desc', 'full_desc',
            'category', 'tech', 'github_url', 'live_url',
            'highlight', 'featured', 'visible', 'order',
        ]


# ─────────────────────────────────────────────────────────────────────────────
# SKILL — grouped response for the frontend
# ─────────────────────────────────────────────────────────────────────────────
class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name', 'icon', 'category', 'order']


class SkillsGroupedSerializer(serializers.Serializer):
    """
    Returns data in the exact shape the React Skills component expects:
    {
        "categories": ["Backend", "Frontend", ...],
        "skills": {
            "Backend": [{"name": "Django", "icon": "🎯"}, ...],
            ...
        }
    }
    """
    def to_representation(self, queryset):
        category_order = ['Backend', 'Frontend', 'AI/ML', 'DevOps & Cloud', 'Data & ML', 'Tools']
        grouped = {}
        for skill in queryset:
            grouped.setdefault(skill.category, []).append({
                'id': skill.id,
                'name': skill.name,
                'icon': skill.icon,
            })
        # Preserve category order
        categories = [c for c in category_order if c in grouped]
        # Add any unexpected categories at the end
        categories += [c for c in grouped if c not in category_order]
        return {
            'categories': categories,
            'skills': {cat: grouped[cat] for cat in categories},
        }


# ─────────────────────────────────────────────────────────────────────────────
# EXPERIENCE
# ─────────────────────────────────────────────────────────────────────────────
class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = [
            'id', 'role', 'company', 'duration', 'exp_type',
            'description', 'tools', 'order',
        ]


# ─────────────────────────────────────────────────────────────────────────────
# CERTIFICATION
# ─────────────────────────────────────────────────────────────────────────────
class CertificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certification
        fields = ['id', 'name', 'issuer', 'date', 'url', 'order']


# ─────────────────────────────────────────────────────────────────────────────
# MESSAGE (Contact Form)
# ─────────────────────────────────────────────────────────────────────────────
class MessageCreateSerializer(serializers.ModelSerializer):
    """Used for POST /api/messages/ — no auth required."""
    class Meta:
        model = Message
        fields = ['name', 'email', 'message']

    def validate_message(self, value):
        if len(value.strip()) < 10:
            raise serializers.ValidationError(
                'Message must be at least 10 characters long.'
            )
        return value.strip()


class MessageSerializer(serializers.ModelSerializer):
    """Full serializer for admin reads."""
    class Meta:
        model = Message
        fields = ['id', 'name', 'email', 'message', 'timestamp', 'read']
        read_only_fields = ['timestamp']


# ─────────────────────────────────────────────────────────────────────────────
# SITE SETTINGS
# ─────────────────────────────────────────────────────────────────────────────
class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = ['section_visibility', 'updated_at']
        read_only_fields = ['updated_at']

"""
Models for the Rohit Ranvir portfolio backend.

All public data (Projects, Skills, Experience, Certifications, Settings)
is READ-only for anonymous users. Write access requires JWT auth.

Contact Messages are write-only for anon (POST), read-only for admin (GET).
"""
from django.db import models


# ─────────────────────────────────────────────────────────────────────────────
# PROJECTS
# ─────────────────────────────────────────────────────────────────────────────
class Project(models.Model):
    CATEGORY_CHOICES = [
        ('Web Dev', 'Web Dev'),
        ('ML & AI', 'ML & AI'),
        ('Data', 'Data'),
        ('Tools', 'Tools'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField(
        help_text='Short 1-line description shown in compact view'
    )
    short_desc = models.CharField(
        max_length=300,
        blank=True,
        help_text='One-line descriptor for card subtitle'
    )
    full_desc = models.TextField(
        blank=True,
        help_text='Expanded description shown in featured/wide card'
    )
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='Web Dev')
    # Stored as a comma-separated string; serializer converts to list
    tech = models.JSONField(default=list, help_text='e.g. ["Django", "React", "Docker"]')
    github_url = models.URLField(blank=True)
    live_url = models.URLField(blank=True)
    highlight = models.CharField(
        max_length=300,
        blank=True,
        help_text='E.g. "Published IJISRT Paper — DOI: ..."'
    )
    featured = models.BooleanField(default=False)
    visible = models.BooleanField(default=True)
    order = models.PositiveSmallIntegerField(
        default=0,
        help_text='Display order — lower numbers appear first'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', '-created_at']

    def __str__(self):
        return self.title


# ─────────────────────────────────────────────────────────────────────────────
# SKILLS
# ─────────────────────────────────────────────────────────────────────────────
class Skill(models.Model):
    CATEGORY_CHOICES = [
        ('Backend', 'Backend'),
        ('Frontend', 'Frontend'),
        ('AI/ML', 'AI/ML'),
        ('DevOps & Cloud', 'DevOps & Cloud'),
        ('Data & ML', 'Data & ML'),
        ('Tools', 'Tools'),
    ]

    name = models.CharField(max_length=100)
    icon = models.CharField(
        max_length=10,
        default='💻',
        help_text='Emoji or short icon string'
    )
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['category', 'order', 'name']

    def __str__(self):
        return f'{self.category} — {self.name}'


# ─────────────────────────────────────────────────────────────────────────────
# EXPERIENCE
# ─────────────────────────────────────────────────────────────────────────────
class Experience(models.Model):
    TYPE_CHOICES = [
        ('internship', 'Internship'),
        ('job', 'Full-time Job'),
        ('education', 'Education'),
        ('freelance', 'Freelance'),
    ]

    role = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    duration = models.CharField(max_length=100, help_text='E.g. "Jan 2025 – Apr 2025"')
    exp_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='internship')
    # List of bullet points describing responsibilities
    description = models.JSONField(
        default=list,
        help_text='Array of bullet point strings'
    )
    # Tech/tools used in this role
    tools = models.JSONField(default=list, help_text='["Python", "Django", ...]')
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['order', '-id']

    def __str__(self):
        return f'{self.role} @ {self.company}'


# ─────────────────────────────────────────────────────────────────────────────
# CERTIFICATIONS
# ─────────────────────────────────────────────────────────────────────────────
class Certification(models.Model):
    name = models.CharField(max_length=300)
    issuer = models.CharField(max_length=200)
    date = models.CharField(max_length=50, help_text='E.g. "Mar 2025"')
    url = models.URLField(blank=True, help_text='Verification link')
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['order', 'name']

    def __str__(self):
        return f'{self.name} — {self.issuer}'


# ─────────────────────────────────────────────────────────────────────────────
# CONTACT MESSAGES
# ─────────────────────────────────────────────────────────────────────────────
class Message(models.Model):
    name = models.CharField(max_length=200)
    email = models.EmailField()
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f'Message from {self.name} <{self.email}>'


# ─────────────────────────────────────────────────────────────────────────────
# SITE SETTINGS
# ─────────────────────────────────────────────────────────────────────────────
class SiteSettings(models.Model):
    """
    Singleton model — only one row should exist (id=1).
    Stores section visibility and any global site configuration.
    """
    section_visibility = models.JSONField(
        default=dict,
        help_text=(
            'Map of section names to booleans, e.g. '
            '{"hero": true, "about": true, "skills": true, '
            '"projects": true, "experience": true, '
            '"publications": true, "certifications": true, "contact": true}'
        )
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Site Settings'
        verbose_name_plural = 'Site Settings'

    def __str__(self):
        return 'Site Settings'

    @classmethod
    def get_solo(cls):
        """Return the single settings instance, creating it if needed."""
        obj, _ = cls.objects.get_or_create(
            pk=1,
            defaults={
                'section_visibility': {
                    'hero': True,
                    'marquee': True,
                    'about': True,
                    'skills': True,
                    'projects': True,
                    'experience': True,
                    'publications': True,
                    'certifications': True,
                    'contact': True,
                }
            }
        )
        return obj

"""
Management command: python manage.py seed_data

Seeds the database with Rohit Ranvir's portfolio data
from the existing public/data/*.json files.

Usage:
    python manage.py seed_data
    python manage.py seed_data --clear    # wipe existing rows first
"""
import json
import os
from pathlib import Path

from django.core.management.base import BaseCommand

from api.models import Project, Skill, Experience, Certification, SiteSettings


# ── Hardcoded seed data (mirrors the JSON files) ─────────────────────────────
PROJECTS = [
    {
        'title': 'Vendor Connect India',
        'description': 'A hyper-local B2B/B2C marketplace connecting vendors with customers.',
        'short_desc': 'Platform connecting local vendors with customers natively within India.',
        'full_desc': (
            'A hyper-local B2B/B2C marketplace for vendors. Features interactive maps '
            'using Leaflet, a secure payment gateway integration with Razorpay, '
            'and JWT token-based authentication with Docker deployment.'
        ),
        'category': 'Web Dev',
        'tech': ['Django', 'MongoDB', 'React 19', 'Leaflet', 'Razorpay', 'Docker'],
        'github_url': 'https://github.com/rohitranvir',
        'live_url': '',
        'highlight': '',
        'featured': True,
        'visible': True,
        'order': 1,
    },
    {
        'title': 'Multi-Tenant SaaS Expense Manager',
        'description': 'Multi-tenant financial management SaaS with PostgreSQL schema isolation.',
        'short_desc': 'Multi-tenant financial management SaaS.',
        'full_desc': (
            'Scalable multi-tenant architecture for enterprise expense management. '
            'Implements background task processing with Celery/Redis and CI/CD via GitHub Actions.'
        ),
        'category': 'Web Dev',
        'tech': ['Django', 'PostgreSQL', 'Celery', 'Redis', 'React', 'GitHub Actions'],
        'github_url': 'https://github.com/rohitranvir',
        'live_url': '',
        'highlight': '',
        'featured': True,
        'visible': True,
        'order': 2,
    },
    {
        'title': 'YouTube Comment Sentiment Analysis',
        'description': 'Deep learning CNN model that classifies YouTube comment sentiments.',
        'short_desc': 'Published CNN-based YouTube comment sentiment classifier.',
        'full_desc': (
            'A CNN-based sentiment analyzer classifying YouTube comments as positive, '
            'negative, or neutral. Published in IJISRT 2025.'
        ),
        'category': 'ML & AI',
        'tech': ['TensorFlow', 'CNN', 'Flask', 'NLP'],
        'github_url': 'https://github.com/rohitranvir',
        'live_url': '',
        'highlight': 'Published IJISRT Paper — DOI: IJISRT25FEB1017',
        'featured': False,
        'visible': True,
        'order': 3,
    },
    {
        'title': 'SmartReview AI',
        'description': 'AI-powered code review application with Monaco Editor integration.',
        'short_desc': 'LLM-powered automated code review tool.',
        'full_desc': (
            'Utilises large language models to provide automated, intelligent code reviews '
            'directly within an integrated Monaco Editor environment.'
        ),
        'category': 'ML & AI',
        'tech': ['Django', 'LLM Integration', 'React', 'Monaco Editor'],
        'github_url': 'https://github.com/rohitranvir',
        'live_url': '',
        'highlight': '',
        'featured': False,
        'visible': True,
        'order': 4,
    },
]

SKILLS = [
    # Backend
    {'name': 'Python',  'icon': '🐍', 'category': 'Backend', 'order': 1},
    {'name': 'Django',  'icon': '🎯', 'category': 'Backend', 'order': 2},
    {'name': 'DRF',     'icon': '🔌', 'category': 'Backend', 'order': 3},
    {'name': 'FastAPI', 'icon': '⚡', 'category': 'Backend', 'order': 4},
    {'name': 'JWT Auth','icon': '🔑', 'category': 'Backend', 'order': 5},
    {'name': 'Razorpay','icon': '💳', 'category': 'Backend', 'order': 6},
    # Frontend
    {'name': 'React 19',    'icon': '⚛️',  'category': 'Frontend', 'order': 1},
    {'name': 'Tailwind CSS','icon': '💨',  'category': 'Frontend', 'order': 2},
    {'name': 'Leaflet Maps','icon': '🗺️',  'category': 'Frontend', 'order': 3},
    # AI/ML
    {'name': 'TensorFlow',  'icon': '📊', 'category': 'AI/ML', 'order': 1},
    {'name': 'Keras',       'icon': '🔬', 'category': 'AI/ML', 'order': 2},
    {'name': 'Deep Learning','icon': '🧠','category': 'AI/ML', 'order': 3},
    {'name': 'NLP',         'icon': '💬', 'category': 'AI/ML', 'order': 4},
    # DevOps & Cloud
    {'name': 'PostgreSQL',    'icon': '🐘', 'category': 'DevOps & Cloud', 'order': 1},
    {'name': 'MongoDB Atlas', 'icon': '🍃', 'category': 'DevOps & Cloud', 'order': 2},
    {'name': 'Redis',         'icon': '🟥', 'category': 'DevOps & Cloud', 'order': 3},
    {'name': 'Docker',        'icon': '🐳', 'category': 'DevOps & Cloud', 'order': 4},
    {'name': 'GitHub Actions','icon': '🐙', 'category': 'DevOps & Cloud', 'order': 5},
    {'name': 'AWS (EC2/S3)', 'icon': '☁️', 'category': 'DevOps & Cloud', 'order': 6},
    {'name': 'Celery',        'icon': '⚙️', 'category': 'DevOps & Cloud', 'order': 7},
    {'name': 'Cloudinary',    'icon': '☁️', 'category': 'DevOps & Cloud', 'order': 8},
]

EXPERIENCES = [
    {
        'role': 'Web Development Intern',
        'company': 'Zidio Development',
        'duration': 'Jan 2025 – Apr 2025',
        'exp_type': 'internship',
        'description': [
            'Developed responsive frontend components for live client projects',
            'Built pixel-perfect UI implementations from Figma design mockups',
            'Collaborated with cross-functional teams using Git/GitHub workflow',
            'Implemented mobile-first responsive designs with modern CSS patterns',
        ],
        'tools': ['HTML', 'CSS', 'JavaScript', 'React', 'Git', 'Bootstrap'],
        'order': 1,
    },
    {
        'role': 'Data Analyst Intern',
        'company': 'Codesoft Private Limited',
        'duration': 'Jun 2024 – Aug 2024',
        'exp_type': 'internship',
        'description': [
            'Performed exploratory data analysis on large datasets using Python',
            'Built automated reporting dashboards with actionable insights',
            'Executed data cleaning, preprocessing, and advanced visualization',
            'Created strategic insights reports driving business decisions',
        ],
        'tools': ['Python', 'Pandas', 'NumPy', 'SQL', 'Excel', 'Matplotlib', 'Seaborn'],
        'order': 2,
    },
]

SETTINGS_VISIBILITY = {
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


class Command(BaseCommand):
    help = 'Seed the database with Rohit Ranvir portfolio data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Delete all existing data before seeding',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Clearing existing data...')
            Project.objects.all().delete()
            Skill.objects.all().delete()
            Experience.objects.all().delete()
            Certification.objects.all().delete()

        # Projects
        self.stdout.write('Seeding projects...')
        for p in PROJECTS:
            Project.objects.update_or_create(title=p['title'], defaults=p)
        self.stdout.write(self.style.SUCCESS(f'  ✓ {len(PROJECTS)} projects'))

        # Skills
        self.stdout.write('Seeding skills...')
        for s in SKILLS:
            Skill.objects.update_or_create(
                name=s['name'], category=s['category'], defaults=s
            )
        self.stdout.write(self.style.SUCCESS(f'  ✓ {len(SKILLS)} skills'))

        # Experience
        self.stdout.write('Seeding experience...')
        for e in EXPERIENCES:
            Experience.objects.update_or_create(
                role=e['role'], company=e['company'], defaults=e
            )
        self.stdout.write(self.style.SUCCESS(f'  ✓ {len(EXPERIENCES)} experience entries'))

        # Settings singleton
        self.stdout.write('Seeding site settings...')
        settings = SiteSettings.get_solo()
        settings.section_visibility = SETTINGS_VISIBILITY
        settings.save()
        self.stdout.write(self.style.SUCCESS('  ✓ site settings'))

        self.stdout.write(self.style.SUCCESS('\n✅ Database seeded successfully!'))

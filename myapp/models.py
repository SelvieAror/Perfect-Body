from mailbox import Message

from django.db import models
from django.contrib.auth.models import User

class Meal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    meal_name = models.CharField(max_length=255)
    calories = models.IntegerField(default=0)
    protein = models.FloatField(default=0)
    carbs = models.FloatField(default=0)
    fat = models.FloatField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.meal_name}"

class UserProfile(models.Model):

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile"
    )
    role = models.CharField(
        max_length=20,
       choices=[
    ('user', 'User'),
    ('subscribed', 'Subscribed'),
    ('nutritionist', 'Nutritionist'),
    ('admin', 'Admin')
],
        default='user'
    )
    
    subscription = models.BooleanField(
        default=False,
        help_text="True if user has an active subscription"
    )

    
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    active_plan_id = models.CharField(max_length=50, blank=True, default="")
    is_subscribed  = models.BooleanField(default=False)
    email = models.EmailField(blank=True)
    assigned_nutritionist = models.ForeignKey(
    User,
    on_delete=models.SET_NULL,
    null=True,
    blank=True,
    related_name="assigned_clients"
)

    age = models.IntegerField(null=True, blank=True)

    height = models.FloatField(null=True, blank=True)

    weight = models.FloatField(null=True, blank=True)

    goal = models.CharField(max_length=200, blank=True)

    dob = models.DateField(null=True, blank=True)

    
    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.user.username
    

class Consultation(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="consultations"
    )

    nutritionist = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="nutritionist_sessions"
    )

    date = models.CharField(max_length=100)
    time = models.CharField(max_length=50)

    status = models.CharField(
        max_length=20,
        default="upcoming"
    )

    notes = models.TextField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.user.username} - {self.date}"
    
class Blog(models.Model):
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="blogs"
    )

    title = models.CharField(max_length=255)

    content = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class BlogReport(models.Model):
    blog = models.ForeignKey(
        Blog,
        on_delete=models.CASCADE,
        related_name="reports"
    )

    reported_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    reason = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Report on {self.blog.title}"
    
class UserReport(models.Model):
    CATEGORY_CHOICES = [
        ('bug',       'Bug Report'),
        ('abuse',     'Abuse / Misconduct'),
        ('billing',   'Billing Issue'),
        ('feedback',  'General Feedback'),
        ('other',     'Other'),
    ]

    sender      = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="sent_reports")
    category    = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other')
    subject     = models.CharField(max_length=200)
    message     = models.TextField()
    is_resolved = models.BooleanField(default=False)
    created_at  = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        sender_name = self.sender.username if self.sender else "Anonymous"
        return f"[{self.category}] {self.subject} — {sender_name}"   
    


class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sent_messages")
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name="received_messages")
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.sender.username} → {self.receiver.username}"
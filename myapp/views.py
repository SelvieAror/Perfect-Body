import django
from django.shortcuts import render, HttpResponse
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login, authenticate
from django.http import HttpResponse
from django.views import View
from django.http import JsonResponse
from django.conf import settings
from django.shortcuts import get_object_or_404
from .Serializers import MessageSerializer
from myapp.Serializers import BlogReportSerializer, BlogSerializer
from .models import Blog, BlogReport, UserProfile, Meal, Consultation, UserReport, Message, NutritionistMealPlan
from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework_simplejwt.tokens import RefreshToken
import stripe
from rest_framework.permissions import BasePermission
from django.utils.timezone import localtime
from django.utils.timezone import now
from django.db.models import Q
from datetime import datetime



@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.get_or_create(user=instance, defaults={'subscription': False})

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()



def hello_api(request):
    return JsonResponse({
        "message": "Hello from Django backend!"
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    email = request.data.get("email")
    password = request.data.get("password")

    if not email or not password:
        return Response({"error": "Email and password required"}, status=400)

    user = User.objects.filter(email=email).first()

    if not user or not user.check_password(password):
        return Response({"error": "Invalid credentials"}, status=400)

    # ← ADD THIS: Check if user is banned
    try:
        profile = UserProfile.objects.get(user=user)
        if profile.banned:
            return Response({
                "error": "Your account has been banned",
                "ban_reason": profile.ban_reason or "No reason provided"
            }, status=403)
    except UserProfile.DoesNotExist:
        pass

    refresh = RefreshToken.for_user(user)
    profile, _ = UserProfile.objects.get_or_create(user=user)

    
    if user.is_staff or user.is_superuser:
        role = "admin"
    else:
        role = profile.role or "user"

    return Response({
        "access":       str(refresh.access_token),
        "refresh":      str(refresh),
        "username":     user.username,
        "user_id":      user.id,                
        "role":         role,
        "is_superuser": user.is_superuser,
        "is_subscribed": profile.subscription,
    })
    
@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def register(request):
    username = request.data.get("username")
    email = request.data.get("email")
    password = request.data.get("password")
    first_name = request.data.get("first_name", "")
    last_name = request.data.get("last_name", "")
    age = request.data.get("age")
    gender = request.data.get("gender")

    if not username or not password or not email:
        return Response({"error": "Missing required fields"}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({"error": "User already exists"}, status=400)

    if User.objects.filter(email=email).exists():
        return Response({"error": "Email already exists"}, status=400)

    valid_genders = ['M', 'F', 'O', 'N']
    if gender and gender not in valid_genders:
        return Response({"error": "Invalid gender value"}, status=400)

    
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name
    )

    
    profile, created = UserProfile.objects.get_or_create(user=user)
    if age:
        profile.age = age
    
    profile.save()

    return Response({
        "message": "User created successfully",
        "user": {
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "age": age,
            "gender": gender
        }
    })


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def log_meal(request):
    username = request.data.get("username")
    meal_name = request.data.get("meal_name")
    calories = request.data.get("calories", 0)
    protein = request.data.get("protein", 0)
    carbs = request.data.get("carbs", 0)
    fat = request.data.get("fat", 0)

    if not username or not meal_name:
        return Response({"error": "Missing required fields"}, status=400)

    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    meal = Meal.objects.create(
        user=user,
        meal_name=meal_name,
        calories=calories,
        protein=protein,
        carbs=carbs,
        fat=fat
    )

    return Response({
        "message": "Meal logged successfully",
        "meal": {
            "meal_name": meal.meal_name,
            "calories": meal.calories
        }
    })


@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def get_meals(request):
    username = request.GET.get("username")

    if not username:
        return Response({"error": "Username required"}, status=400)

    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    meals = Meal.objects.filter(user=user).order_by('-created_at')
    data = []
    for meal in meals:
        data.append({
            "id": meal.id,
            "meal_name": meal.meal_name,
            "calories": meal.calories,
            "protein": meal.protein,
            "carbs": meal.carbs,
            "fat": meal.fat,
        })
    return Response(data)


@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def get_profile(request):
    username = request.GET.get("username")
    if not username:
        return Response({"error": "Username is required"}, status=400)

    try:
        user = User.objects.get(username=username)
        profile, created = UserProfile.objects.get_or_create(user=user)

        return Response({
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "dob": profile.dob,
            "age": profile.age,
            "weight": profile.weight,
            "height": profile.height,
            "goal": profile.goal,
            "subscription": profile.subscription,   
        })
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def update_profile(request):
    current_username = request.data.get("current_username")
    if not current_username:
        return Response({"error": "Current username is required"}, status=400)

    try:
        user = User.objects.get(username=current_username)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    new_username = request.data.get("username", user.username)
    if new_username != user.username and User.objects.filter(username=new_username).exists():
        return Response({"error": "Username already exists"}, status=400)

    user.username = new_username
    user.email = request.data.get("email", user.email)
    user.first_name = request.data.get("first_name", user.first_name)
    user.last_name = request.data.get("last_name", user.last_name)
    user.save()

    profile, created = UserProfile.objects.get_or_create(user=user)

    def safe_int(value, default=0):
        try:
            return int(value)
        except (ValueError, TypeError):
            return default

    def safe_float(value, default=0.0):
        try:
            return float(value)
        except (ValueError, TypeError):
            return default

    dob = request.data.get("dob")
    profile.dob = dob if dob else None
    profile.age = safe_int(request.data.get("age"), profile.age or 0)
    profile.weight = safe_float(request.data.get("weight"), profile.weight or 0.0)
    profile.height = safe_float(request.data.get("height"), profile.height or 0.0)
    profile.goal = request.data.get("goal", profile.goal or "maintenance")
    profile.save()

    return Response({
        "message": "Profile updated successfully",
        "username": user.username,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "dob": profile.dob,
        "age": profile.age,
        "weight": profile.weight,
        "height": profile.height,
        "goal": profile.goal,
    })


@api_view(['DELETE'])
@authentication_classes([])
@permission_classes([AllowAny])
def delete_meal(request):
    meal_id = request.GET.get("meal_id")
    username = request.GET.get("username")
    if not meal_id or not username:
        return Response({"error": "meal_id and username are required"}, status=400)

    try:
        meal = Meal.objects.get(id=meal_id, user__username=username)
        meal.delete()
        return Response({"message": "Meal deleted"})
    except Meal.DoesNotExist:
        return Response({"error": "Meal not found or not owned by user"}, status=404)


@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def get_nutritionists(request):
    nutritionists = UserProfile.objects.filter(role="nutritionist")
    data = []
    for profile in nutritionists:
        user = profile.user
        full_name = f"{user.first_name} {user.last_name}".strip()
        if not full_name:
            full_name = user.username
        data.append({
            "id": user.id,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "display_name": f"Dr. {full_name}"
        })
    return Response(data)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def save_nutritionist(request):

    nutritionist_id = request.data.get("nutritionist_id")

    try:
        nutritionist = User.objects.get(id=nutritionist_id)

        profile = request.user.profile
        profile.assigned_nutritionist = nutritionist
        profile.save()

        return Response({
            "success": True
        })

    except User.DoesNotExist:
        return Response(
            {"error": "Nutritionist not found"},
            status=404
        )

@api_view(["GET"])
@permission_classes([AllowAny])
def get_assigned_nutritionist(request):
    username = request.GET.get("username")
    if not username:
        return Response({"error": "Username required"}, status=400)

    try:
        user = User.objects.get(username=username)
        profile, _ = UserProfile.objects.get_or_create(user=user)

        
        if not profile.assigned_nutritionist:
            return Response({"error": "No nutritionist assigned"}, status=404)

        nut = profile.assigned_nutritionist
        return Response({
            "id": nut.id,
            "username": nut.username,
            "first_name": nut.first_name,
            "last_name": nut.last_name,
            "display_name": f"Dr. {nut.first_name} {nut.last_name}"
        })
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

        
@api_view(["POST"])
@permission_classes([AllowAny])
def book_consultation(request):
    username = request.data.get("username")
    nutritionist_id = request.data.get("nutritionist_id")
    date = request.data.get("date")
    time = request.data.get("time")

    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    try:
        nutritionist = User.objects.get(id=nutritionist_id)
    except User.DoesNotExist:
        return Response({"error": "Nutritionist not found"}, status=404)

    consultation = Consultation.objects.create(
        user=user,
        nutritionist=nutritionist,
        date=date,
        time=time,
        status="upcoming",
        notes=""
    )

    return Response({
        "id": consultation.id,
        
        "nutritionist": f"Dr. {nutritionist.first_name} {nutritionist.last_name}",
        "date": consultation.date,
        "time": consultation.time,
        "status": consultation.status,
        "notes": consultation.notes
    })
    
@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def get_consultations(request):
    username = request.GET.get("username")
    try:
        user = User.objects.get(username=username)
        consultations = Consultation.objects.filter(user=user).order_by("-created_at")
        data = []
        for c in consultations:
            data.append({
                "id": c.id,
                "nutritionist": f"Dr. {c.nutritionist.first_name} {c.nutritionist.last_name}",
                "date": c.date,
                "time": c.time,
                "status": c.status,
                "notes": c.notes,
            })
        return Response(data)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)



stripe.api_key = settings.STRIPE_SECRET_KEY


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_checkout_session(request):
    try:
        plan = request.data.get('plan')
        price_id = None
        if plan == 'monthly':
            price_id = 'price_monthly_123'     
        elif plan == 'seasonal':
            price_id = 'price_seasonal_123'    
        elif plan == 'ramadan_special':
            price_id = 'price_ramadan_123'     
        else:
            return Response({'error': 'Invalid plan'}, status=400)

        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price': price_id,
                'quantity': 1,
            }],
            mode='subscription' if plan in ['monthly', 'seasonal'] else 'payment',
            success_url='http://localhost:3000/payment-success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url='http://localhost:3000/payment-cancel',
            metadata={'user_id': request.user.id}
        )
        return Response({'sessionId': checkout_session.id, 'url': checkout_session.url})
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    event = None

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        return Response(status=400)
    except stripe.error.SignatureVerificationError:
        return Response(status=400)

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        user_id = session.get('metadata', {}).get('user_id')
        if user_id:
            try:
                profile = UserProfile.objects.get(user_id=user_id)
                profile.subscription = True
                profile.save()
            except UserProfile.DoesNotExist:
                pass

    return Response(status=200)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    user = request.user
    profile, created = UserProfile.objects.get_or_create(user=user)
    return Response({
        "username": user.username,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "subscription": profile.subscription,           
        "subscription_status": "Active" if profile.subscription else "Inactive"
    })



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_subscription(request):
    profile = UserProfile.objects.get(user=request.user)
    return Response({
        "subscribed": profile.subscription,
        "status": "active" if profile.subscription else "inactive"
    })
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mock_subscribe(request):
    try:
        profile, created = UserProfile.objects.get_or_create(
            user=request.user
        )

        
        profile.subscription = True

        
        profile.role = "subscribed"

        profile.save()

        return Response({
            "success": True,
            "message": "Subscription activated",
            "role": profile.role,
            "subscription": profile.subscription
        })

    except Exception as e:
        return Response({
            "error": str(e)
        }, status=400)
        

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    profile, _ = UserProfile.objects.get_or_create(user=request.user)
    role = "admin" if (request.user.is_staff or request.user.is_superuser) else (profile.role or "user")
    return Response({
        "username":     request.user.username,
        "role":         role,
        "is_subscribed": profile.subscription,  
    })
    
class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.is_superuser
        )
def is_admin(user):
    """Helper: returns True if the user has admin privileges."""
    
    if user.is_superuser or user.is_staff:
        return True
    
    
    try:
        return user.profile.role == "admin"
    except UserProfile.DoesNotExist:
        return False
 
 

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_list_users(request):
    """Return all users with their profile info. Admin only."""
    if not is_admin(request.user):
        return Response({"error": "Forbidden"}, status=403)
 
    profiles = UserProfile.objects.select_related('user').all()
    data = []
    for profile in profiles:
        u = profile.user
        data.append({
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "role": profile.role or "user",
            "subscription": profile.subscription,
            "banned": profile.banned,  
            "ban_reason": profile.ban_reason,  
            "date_joined": u.date_joined.strftime("%Y-%m-%d"),
        })
    return Response(data)
 
@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminRole])
def admin_get_users(request):
    users = User.objects.all().order_by("-date_joined")
    data = []
    for user in users:
        profile, created = UserProfile.objects.get_or_create(user=user)
        data.append({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": profile.role,
            "subscription": profile.subscription,
            "banned": profile.banned,  
            "ban_reason": profile.ban_reason,  
            "date_joined": localtime(user.date_joined).strftime("%Y-%m-%d"),
        })
    return Response(data)

    return Response(data)
@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdminRole])
def admin_update_role(request, user_id):

    try:
        target_user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    role = request.data.get("role")

    valid_roles = ["user", "subscribed", "nutritionist", "admin"]

    if role not in valid_roles:
        return Response({"error": "Invalid role"}, status=400)

    profile, created = UserProfile.objects.get_or_create(user=target_user)

    profile.role = role

    
    if role == "subscribed":
        profile.subscription = True
    else:
        profile.subscription = False

    profile.save()

    return Response({
        "success": True,
        "username": target_user.username,
        "role": profile.role,
        "subscription": profile.subscription
    })
    

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_set_role(request, user_id):
    """
    Set the role for a user. Admin only.
    Body: { "role": "user" | "subscribed" | "nutritionist" | "admin" }
    """
    if not is_admin(request.user):
        return Response({"error": "Forbidden"}, status=403)
 
    valid_roles = ["user", "subscribed", "nutritionist", "admin"]
    role = request.data.get("role")
 
    if role not in valid_roles:
        return Response({"error": f"Invalid role. Must be one of: {valid_roles}"}, status=400)
 
    
    if user_id == request.user.id and role != "admin":
        return Response({"error": "You cannot change your own admin role"}, status=400)
 
    try:
        target_user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)
 
    profile, _ = UserProfile.objects.get_or_create(user=target_user)
    profile.role = role
    
    profile.subscription = role in ["subscribed", "nutritionist", "admin"]
    profile.save()
 
    return Response({
        "success": True,
        "user_id": user_id,
        "username": target_user.username,
        "new_role": profile.role,
        "subscription": profile.subscription,
    })
 
 

@api_view(["DELETE"])
@permission_classes([IsAuthenticated, IsAdminRole])
def admin_delete_user(request, user_id):

    try:
        target_user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    
    if target_user == request.user:
        return Response({"error": "You cannot delete yourself"}, status=400)

    target_user.delete()

    return Response({
        "success": True
    })
    
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_my_patients(request):
    """Returns all users assigned to this nutritionist."""
    patients = UserProfile.objects.filter(
        assigned_nutritionist=request.user
    ).select_related("user")

    data = []
    for profile in patients:
        u = profile.user
        
        today_meals = Meal.objects.filter(
            user=u,
            created_at__date=now().date()
        )
        total_kcal = sum(m.calories for m in today_meals)
        meals_list = [
            {"meal_name": m.meal_name, "calories": m.calories}
            for m in today_meals
        ]
        data.append({
            "id": u.id,
            "username": u.username,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "full_name": f"{u.first_name} {u.last_name}".strip() or u.username,
            "age": profile.age,
            "weight": profile.weight,
            "height": profile.height,
            "goal": profile.goal or "—",
            "subscription": profile.subscription,
            "today_calories": total_kcal,
            "today_meals": meals_list,
        })
    return Response(data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_my_consultations(request):
    """Returns all consultations where this user is the nutritionist."""
    consultations = Consultation.objects.filter(
        nutritionist=request.user
    ).select_related("user").order_by("date", "time")

    data = []
    for c in consultations:
        data.append({
            "id": c.id,
            "patient": f"{c.user.first_name} {c.user.last_name}".strip() or c.user.username,
            "patient_username": c.user.username,
            "date": c.date,
            "time": c.time,
            "status": c.status,
            "notes": c.notes or "",
        })
    return Response(data)



@api_view(["POST"])
@permission_classes([IsAuthenticated])
def save_consultation_notes(request, consultation_id):
    """Nutritionist saves notes/plan for a specific consultation."""
    try:
        consultation = Consultation.objects.get(
            id=consultation_id,
            nutritionist=request.user   
        )
    except Consultation.DoesNotExist:
        return Response({"error": "Consultation not found or access denied"}, status=404)

    notes = request.data.get("notes", "")
    status = request.data.get("status", consultation.status)

    consultation.notes = notes
    consultation.status = status
    consultation.save()

    return Response({
        "success": True,
        "id": consultation.id,
        "notes": consultation.notes,
        "status": consultation.status,
    })



@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_nutritionist_stats(request):
    total_patients = UserProfile.objects.filter(
        assigned_nutritionist=request.user
    ).count()

    today_consultations = Consultation.objects.filter(
        nutritionist=request.user,
        date=now().strftime("%B %d, %Y"),   
        status="upcoming"
    ).count()

    pending_followups = Consultation.objects.filter(
        nutritionist=request.user,
        status="upcoming"
    ).count()

    return Response({
        "total_patients": total_patients,
        "today_consultations": today_consultations,
        "pending_followups": pending_followups,
    })
    
@api_view(['GET'])
@permission_classes([AllowAny])
def get_blogs(request):
    """Get all blogs. No authentication required."""
    blogs = Blog.objects.all().order_by('-created_at')
    serializer = BlogSerializer(blogs, many=True)
    return Response(serializer.data)
 
 
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_blog(request):
    """Create a new blog. Authentication required."""
    title = request.data.get('title', '').strip()
    content = request.data.get('content', '').strip()
 
    if not title or not content:
        return Response({'error': 'Title and content are required'}, status=400)
 
    blog = Blog.objects.create(
        author=request.user,
        title=title,
        content=content
    )
 
    serializer = BlogSerializer(blog)
    return Response(serializer.data, status=201)
 
 
@api_view(['GET'])
@permission_classes([AllowAny])
def get_blog(request, blog_id):
    """Get a single blog by ID."""
    blog = get_object_or_404(Blog, id=blog_id)
    serializer = BlogSerializer(blog)
    return Response(serializer.data)
 
 
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def report_blog(request, blog_id):
    """Report a blog. Authentication required."""
    blog = get_object_or_404(Blog, id=blog_id)
    reason = request.data.get('reason', '')
 
    
    existing_report = BlogReport.objects.filter(
        blog=blog,
        reported_by=request.user
    ).first()
 
    if existing_report:
        return Response(
            {'error': 'You have already reported this blog'},
            status=400
        )
 
    report = BlogReport.objects.create(
        blog=blog,
        reported_by=request.user,
        reason=reason
    )
 
    serializer = BlogReportSerializer(report)
    return Response(serializer.data, status=201)
 
 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_reports(request):
    """Get all reports. Admin only."""
    try:
        profile = request.user.profile
    except:
        return Response({'error': 'Unauthorized'}, status=403)
 
    if profile.role != 'admin':
        return Response({'error': 'Unauthorized'}, status=403)
 
    reports = BlogReport.objects.all().order_by('-created_at')
    serializer = BlogReportSerializer(reports, many=True)
    return Response(serializer.data)
 
 
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_blog(request, blog_id):
    """Delete a blog. Author or admin only."""
    blog = get_object_or_404(Blog, id=blog_id)

    is_author = blog.author.id == request.user.id
    is_admin_user = is_admin(request.user)  

    if not (is_author or is_admin_user):
        return Response(
            {'error': 'You can only delete your own blogs'},
            status=403
        )

    blog.delete()
    return Response({"message": "Blog deleted"})


@api_view(["POST"])
@permission_classes([IsAuthenticated])   
def submit_report(request):
    subject  = request.data.get("subject", "").strip()
    message  = request.data.get("message", "").strip()
    category = request.data.get("category", "other")

    if not subject or not message:
        return Response({"error": "Subject and message are required."}, status=400)

    valid_categories = ["bug", "abuse", "billing", "feedback", "other"]
    if category not in valid_categories:
        category = "other"

    report = UserReport.objects.create(
        sender=request.user,   
        category=category,
        subject=subject,
        message=message,
    )

    return Response({"success": True, "id": report.id}, status=201)



@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_reports(request):
    """Admin only — returns all user contact reports."""
    
    if not (request.user.is_superuser or request.user.is_staff or is_admin(request.user)):
        return Response({"error": "Forbidden"}, status=403)

    reports = UserReport.objects.select_related("sender").order_by("-created_at")
    data = []
    for r in reports:
        data.append({
            "id":          r.id,
            "sender":      r.sender.username if r.sender else "Anonymous",
            "category":    r.category,
            "subject":     r.subject,
            "message":     r.message,
            "is_resolved": r.is_resolved,
            "created_at":  r.created_at.strftime("%Y-%m-%d %H:%M"),
        })
    return Response(data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def resolve_report(request, report_id):
    """Admin only — toggle a report's resolved status."""
    if not (request.user.is_superuser or request.user.is_staff or is_admin(request.user)):
        return Response({"error": "Forbidden"}, status=403)

    try:
        report = UserReport.objects.get(id=report_id)
    except UserReport.DoesNotExist:
        return Response({"error": "Report not found"}, status=404)

    report.is_resolved = not report.is_resolved
    report.save()
    return Response({"success": True, "is_resolved": report.is_resolved})

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_messages(request):
    """Get all messages between current user and another user"""
    other_user_id = request.GET.get("user_id")

    if not other_user_id:
        return Response({"error": "user_id required"}, status=400)

    try:
        other_user = User.objects.get(id=other_user_id)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    
    messages = Message.objects.filter(
        Q(sender=request.user, receiver=other_user) |
        Q(sender=other_user, receiver=request.user)
    ).order_by("created_at")

    
    Message.objects.filter(sender=other_user, receiver=request.user).update(read=True)

    data = []
    for msg in messages:
       data.append({
    "id": msg.id,
    "sender_username": msg.sender.username,
    "sender_id": msg.sender.id,
    "receiver_username": msg.receiver.username,
    "receiver_id": msg.receiver.id,
    "text": msg.text,
    "created_at": msg.created_at.strftime("%H:%M"),
    "read": msg.read,
    "is_mine": msg.sender.id == request.user.id,  
})

    return Response(data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_message(request):
    """Send a message to another user"""
    receiver_id = request.data.get("receiver_id")
    text = request.data.get("text", "").strip()

    if not receiver_id or not text:
        return Response(
            {"error": "receiver_id and text required"},
            status=400
        )

    try:
        receiver = User.objects.get(id=receiver_id)
    except User.DoesNotExist:
        return Response({"error": "Receiver not found"}, status=404)

    message = Message.objects.create(
        sender=request.user,
        receiver=receiver,
        text=text
    )

    return Response({
        "id": message.id,
        "sender_username": message.sender.username,
        "sender_id": message.sender.id,
        "receiver_username": message.receiver.username,
        "receiver_id": message.receiver.id,
        "text": message.text,
        "created_at": message.created_at.strftime("%H:%M"),
        "read": message.read,
    }, status=201)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_nutritionist_message_patients(request):
    """Get all patients this nutritionist has messages with"""
    
    patients = User.objects.filter(
        Q(sent_messages__receiver=request.user) |
        Q(received_messages__sender=request.user)
    ).distinct()

    data = []
    for patient in patients:
        
        last_msg = Message.objects.filter(
            Q(sender=patient, receiver=request.user) |
            Q(sender=request.user, receiver=patient)
        ).order_by('-created_at').first()

        
        unread = Message.objects.filter(
            sender=patient,
            receiver=request.user,
            read=False
        ).count()

        data.append({
            "id": patient.id,
            "name": f"{patient.first_name} {patient.last_name}".strip() or patient.username,
            "username": patient.username,
            "last_message": last_msg.text if last_msg else "",
            "unread_count": unread,
        })

    
    data.sort(key=lambda x: x['last_message'], reverse=True)
    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ban_user(request, user_id):
    """Ban a user. Admin only."""
    if not is_admin(request.user):
        return Response({"error": "Forbidden"}, status=403)
    
    try:
        target_user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)
    
    # Prevent banning yourself
    if target_user.id == request.user.id:
        return Response({"error": "You cannot ban yourself"}, status=400)
    
    reason = request.data.get("reason", "")
    
    profile, _ = UserProfile.objects.get_or_create(user=target_user)
    profile.banned = True
    profile.ban_reason = reason
    profile.save()
    
    return Response({
        "success": True,
        "username": target_user.username,
        "banned": True,
        "ban_reason": reason,
    })
 
 
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def unban_user(request, user_id):
    """Unban a user. Admin only."""
    if not is_admin(request.user):
        return Response({"error": "Forbidden"}, status=403)
    
    try:
        target_user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)
    
    profile, _ = UserProfile.objects.get_or_create(user=target_user)
    profile.banned = False
    profile.ban_reason = ""
    profile.save()
    
    return Response({
        "success": True,
        "username": target_user.username,
        "banned": False,
    })
 
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def toggle_pin_blog(request, blog_id):
    """Toggle pinned status on a blog. Admin only."""
    if not is_admin(request.user):
        return Response({"error": "Forbidden"}, status=403)

    blog = get_object_or_404(Blog, id=blog_id)
    blog.pinned = not blog.pinned
    blog.save()

    return Response({"success": True, "pinned": blog.pinned, "id": blog.id})

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_patient_meal_plan(request, patient_id):
    """Nutritionist fetches a patient's custom meal plan."""
    try:
        plan = NutritionistMealPlan.objects.get(
            nutritionist=request.user,
            patient_id=patient_id
        )
        return Response({"meals": plan.meals})
    except NutritionistMealPlan.DoesNotExist:
        return Response({"meals": []})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def save_patient_meal_plan(request, patient_id):
    """Nutritionist saves a custom meal plan for a patient."""
    try:
        patient = User.objects.get(id=patient_id)
    except User.DoesNotExist:
        return Response({"error": "Patient not found"}, status=404)

    meals = request.data.get("meals", [])
    if not isinstance(meals, list):
        return Response({"error": "meals must be a list"}, status=400)

    plan, _ = NutritionistMealPlan.objects.update_or_create(
        nutritionist=request.user,
        patient=patient,
        defaults={"meals": meals}
    )
    return Response({"success": True, "meals": plan.meals})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_my_meal_plan(request):
    """Patient fetches the meal plan their nutritionist assigned them."""
    try:
        profile = request.user.profile
    except UserProfile.DoesNotExist:
        return Response({"meals": []})

    if not profile.assigned_nutritionist:
        return Response({"meals": []})

    try:
        plan = NutritionistMealPlan.objects.get(
            nutritionist=profile.assigned_nutritionist,
            patient=request.user
        )
        return Response({"meals": plan.meals})
    except NutritionistMealPlan.DoesNotExist:
        return Response({"meals": []})
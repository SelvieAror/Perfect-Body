
from django import views

from myapp.views import admin_delete_user, admin_get_users, admin_list_users, admin_set_role, admin_update_role, ban_user, book_consultation, create_checkout_session, delete_blog, get_assigned_nutritionist, get_consultations, get_messages, get_my_meal_plan, get_my_patients, get_nutritionist_message_patients, get_nutritionists, get_patient_meal_plan, get_reports, get_user_reports, log_meal, me, mock_subscribe, register, login_view, get_meals, report_blog, resolve_report, save_consultation_notes, save_patient_meal_plan, send_message, stripe_webhook, submit_report, toggle_pin_blog, unban_user, update_profile, get_profile, delete_meal, save_nutritionist, get_my_consultations, get_nutritionist_stats
from myapp.views import get_blogs, create_blog, get_blog
from django.contrib import admin
from django.urls import path, include
from myapp.views import hello_api
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),

    path("api/", include("myapp.urls")),

    path('api/hello/', hello_api),

    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('accounts/', include('django.contrib.auth.urls')),

    path('api/register/', register),
    path("api/login/", login_view),
    path('log-meal/', log_meal),
    path('get-meals/', get_meals),
    path('update-profile/', update_profile),
    path("get-profile/", get_profile),
    path('delete-meal/', delete_meal, name='delete-meal'),
    path("api/get-nutritionists/", get_nutritionists),
    path("api/book-consultation/", book_consultation),
    path("api/get-consultations/", get_consultations),
    path('api/create-checkout-session/', create_checkout_session, name='create_checkout_session'),
    path('api/stripe-webhook/', stripe_webhook, name='stripe_webhook'),
    path('api/mock-subscribe/', mock_subscribe, name='mock_subscribe'),
    path('api/me/', me, name='me'), 
    path('admin/users/',admin_list_users, name='admin-list-users'),
    path('admin/users/<int:user_id>/role/',admin_set_role, name='admin-set-role'),
    path('admin/users/<int:user_id>/',admin_delete_user, name='admin-delete-user'),
    path("api/admin/users/", admin_get_users),
    path("api/admin/users/<int:user_id>/role/", admin_update_role),
    path("api/save_nutritionist/", save_nutritionist),
    path("api/get-assigned-nutritionist/", get_assigned_nutritionist),
    path("api/nutritionist/patients/", get_my_patients, name="nutritionist-patients"),
    path("api/nutritionist/consultations/", get_my_consultations, name="nutritionist-consultations"),
    path("api/nutritionist/consultations/<int:consultation_id>/notes/", save_consultation_notes, name="save-consultation-notes"),
    path("api/nutritionist/stats/", get_nutritionist_stats, name="nutritionist-stats"),
    path('api/blogs/', get_blogs, name='get_blogs'),
    path('api/blogs/create/', create_blog, name='create_blog'),
    path('api/blogs/<int:blog_id>/', get_blog, name='get_blog'),
    path('api/blogs/<int:blog_id>/report/', report_blog, name='report_blog'),
    path('api/blogs/<int:blog_id>/delete/', delete_blog, name='delete_blog'),
    path('api/blog-reports/', get_reports, name='get_reports'),
    path('api/submit-report/', submit_report, name='submit_report'),
    path("api/reports/", submit_report, name="submit-report"),
    path("api/reports/<int:report_id>/resolve/", resolve_report, name="resolve-report"),
    path("api/reports/all/", get_user_reports, name="get-user-reports"),
    path("api/messages/", get_messages),          
    path("api/send-message/", send_message),
    path("api/nutritionist/messages/patients/", get_nutritionist_message_patients),
    path("api/admin/users/<int:user_id>/ban/", ban_user, name="ban-user"),
    path("api/admin/users/<int:user_id>/unban/", unban_user, name="unban-user"),
    path("api/blogs/<int:blog_id>/pin/", toggle_pin_blog, name="toggle-pin-blog"),
    path("api/nutritionist/patients/<int:patient_id>/meal-plan/", get_patient_meal_plan, name="get-patient-meal-plan"),
    path("api/nutritionist/patients/<int:patient_id>/meal-plan/save/", save_patient_meal_plan, name="save-patient-meal-plan"),
    path("api/my-meal-plan/", get_my_meal_plan, name="my-meal-plan"),
]
from django.core.management.base import BaseCommand, CommandError
from django.test import RequestFactory
from django.contrib.auth.middleware import AuthenticationMiddleware
from django.contrib.auth.middleware import RemoteUserMiddleware
from django.contrib.sessions.middleware import SessionMiddleware
from userservice.user import UserServiceMiddleware
import os
from myuw.views.page import index


def get_request():
    factory = RequestFactory()
    r = factory.get("/", HTTP_USER_AGENT="fake iPhone!")
    r.META["REMOTE_USER"] = "eight"

    SessionMiddleware().process_request(r)
    AuthenticationMiddleware().process_request(r)
    RemoteUserMiddleware().process_request(r)
    UserServiceMiddleware().process_request(r)

    return r

class Command(BaseCommand):
    help = ("Runs view code.  Use this for profiling - but expect to make "
            "changes to meet your profiling needs")

    def handle(self, *args, **kwargs):
        for i in range(10):
            r = get_request()
            index(r)

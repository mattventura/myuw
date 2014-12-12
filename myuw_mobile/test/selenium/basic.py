from myuw_mobile.test.selenium import skip_selenium, on_platforms
from unittest2 import skipIf
from django.test import LiveServerTestCase


class BasicTest(LiveServerTestCase):
    @skipIf(skip_selenium(), "Needs RUN_SELENIUM=True as an env variable")
    @on_platforms
    def test_basic(self, desired_capabilities):
        print desired_capabilities
        self.assertEquals(desired_capabilities["platform"], "Mac OS X 10.9")
        print "OK"
#        self.driver.get(self.live_server_url + '/mobile/landing')
#        print self.driver.title


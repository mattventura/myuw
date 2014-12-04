from django.test import TestCase
import datetime
from myuw_mobile.dao.category_links import _get_links_by_category_and_campus, \
    _get_category_id


class TestCategoryLinks(TestCase):

    def test_get_by_category_id(self):
        category_id = _get_category_id("Student & Campus Life")
        self.assertEquals(category_id, "studentcampuslife")

        links = _get_links_by_category_and_campus(category_id, "seattle")

        self.assertEquals(len(links), 24)

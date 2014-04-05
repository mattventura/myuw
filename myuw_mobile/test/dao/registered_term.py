from django.test import TestCase
from django.conf import settings

from myuw_mobile.dao.term import _get_term_by_year_and_quarter
from myuw_mobile.dao.schedule import _get_schedule
from myuw_mobile.dao.registered_term import _get_registered_summer_terms
from myuw_mobile.dao.registered_term import _must_displayed_separately
from myuw_mobile.dao.registered_term import _get_registered_future_quarters

from restclients.models import ClassSchedule, Term, Section, Person

class TestRegisteredTerm(TestCase):

    def test_get_registered_summer_terms(self):
        with self.settings(
            RESTCLIENTS_PWS_DAO_CLASS='restclients.dao_implementation.pws.File',
            RESTCLIENTS_SWS_DAO_CLASS='restclients.dao_implementation.sws.File'):
            regid = "9136CCB8F66711D5BE060004AC494FFE"
            term = Term()
            term.year = 2013
            term.quarter = "summer"
            schedule = _get_schedule(regid, term)
            data = _get_registered_summer_terms(schedule.sections)
            self.assertFalse(data["A"])
            self.assertTrue(data["B"])
            self.assertTrue(data["F"])

    def test_must_displayed_separately(self):
        with self.settings(
            RESTCLIENTS_PWS_DAO_CLASS='restclients.dao_implementation.pws.File',
            RESTCLIENTS_SWS_DAO_CLASS='restclients.dao_implementation.sws.File'):
            regid = "9136CCB8F66711D5BE060004AC494FFE"
            term = Term()
            term.year = 2013
            term.quarter = "summer"
            schedule = _get_schedule(regid, term)
            self.assertTrue(_must_displayed_separately(schedule))

    def test_get_registered_future_quarters(self):
        with self.settings(
            RESTCLIENTS_PWS_DAO_CLASS='restclients.dao_implementation.pws.File',
            RESTCLIENTS_SWS_DAO_CLASS='restclients.dao_implementation.sws.File'):
            regid = "9136CCB8F66711D5BE060004AC494FFE"
            term1 = _get_term_by_year_and_quarter(2013, "summer")
            schedule1 = _get_schedule(regid, term1)
            self.assertEqual(len(schedule1.sections), 5)

            term2 = _get_term_by_year_and_quarter(2013, "autumn")
            schedule2 = _get_schedule(regid, term2)
            self.assertEqual(len(schedule2.sections), 5)

            terms = _get_registered_future_quarters(schedule1, schedule2)
            self.assertTrue(len(terms)==3)
            self.assertTrue(terms[0]['year'] == 2013)
            self.assertEqual(terms[0]['quarter'], "Summer")
            self.assertEqual(terms[0]['summer_term'], "A-term")

            self.assertTrue(terms[1]['year'] == 2013)
            self.assertEqual(terms[1]['quarter'], "Summer")
            self.assertEqual(terms[1]['summer_term'], "B-term")

            self.assertTrue(terms[2]['year'] == 2013)
            self.assertEqual(terms[2]['quarter'], "Autumn")
            self.assertEqual(terms[2]['summer_term'], "")
                

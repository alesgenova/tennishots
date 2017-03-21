from decimal import Decimal, ROUND_HALF_UP
from django.utils import timezone
from django.conf import settings
from django.shortcuts import get_object_or_404
from paypal.standard.models import ST_PP_COMPLETED
from paypal.standard.ipn.signals import valid_ipn_received
from customers.models import Order, Transaction

def payment_notification(sender, **kwargs):
    ipn_obj = sender
    if ipn_obj.payment_status == ST_PP_COMPLETED:
        # payment was successful
        # check we are the ones who actually got paid
        if ipn_obj.receiver_email != settings.PAYPAL_RECEIVER_EMAIL:
            return
        # and in the right amount
        cents = Decimal('0.01')
        paid_amount = Decimal(ipn_obj.mc_gross).quantize(cents, ROUND_HALF_UP)

        order = get_object_or_404(Order, id=int(ipn_obj.invoice))
        customer = order.user.customerprofile
        # Looks like paypal might send several connections, we don't want the shots
        # counters to become negative
        order_already_paid = order.paid
        # mark the order as paid
        order.paid_amount = paid_amount
        order.outstanding_amount = order.amount - paid_amount
        order.paid = True
        order.txn_id = ipn_obj.txn_id
        order.save()
        if not order_already_paid:
            # update the customer balance
            customer.outstanding_shots -= order.shots
            customer.outstanding_videoshots -= order.videoshots
            new_amount_due = customer.amount_due - float(paid_amount)
            if new_amount_due < 0.02:
                customer.amount_due = 0.0
            else:
                customer.amount_due = new_amount_due
            customer.save()
            # create a new transaction instance, just for the recording_count
            transaction = Transaction()
            transaction.user = order.user
            transaction.shot_count = -order.shots
            transaction.videoshot_count = -order.videoshots
            transaction.dollar_amount = -order.amount
            transaction.order = order
            transaction.save()

        profile = order.user.userprofile
        profile.last_change = timezone.now()
        profile.save()
    return

valid_ipn_received.connect(payment_notification)

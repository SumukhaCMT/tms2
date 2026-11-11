export const TODAY_IST = `DATE(CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+05:30'))`

export const LIVE_SUBSCRIPTION = `os.subscription_status = 'active' AND os.start_date <= ${TODAY_IST} AND (os.expiry_date IS NULL OR os.expiry_date > ${TODAY_IST})`

export const USER_LIMIT_SQL = `o.org_default_users + COALESCE((
  SELECT SUM(os.granted_quantity)
  FROM org_subscriptions os
  JOIN subscription_plans sp ON sp.id = os.plan_id
  JOIN modules m ON m.id = sp.module_id
  WHERE os.organization_id = o.id AND m.module_code = 'Users' AND ${LIVE_SUBSCRIPTION}
), 0)`

export const UNPAID_SUB_MODULES_SQL = `
  SELECT sm.sub_module_code
  FROM sub_modules sm
  JOIN modules m ON m.id = sm.module_id
  WHERE m.module_code NOT IN ('common_module', 'subscription')
    AND NOT EXISTS (
      SELECT 1
      FROM org_subscriptions os
      LEFT JOIN subscription_bundle_items sbi ON os.plan_id IS NULL AND sbi.bundle_id = os.bundle_id
      LEFT JOIN subscription_plans sp ON sp.id = COALESCE(os.plan_id, sbi.plan_id)
      WHERE os.organization_id = ?
        AND ${LIVE_SUBSCRIPTION}
        AND (sp.module_id = m.id OR os.is_free_trial = 1)
        AND NOT EXISTS (
          SELECT 1
          FROM order_items oi
          JOIN orders o ON o.id = oi.order_id
          WHERE oi.org_subscription_id = os.id
            AND (o.payment_status <> 'paid' OR o.order_status = 'cancelled')
        )
    )
`

export const EXPIRED_SUB_MODULES_SQL = `
  SELECT DISTINCT sm.sub_module_code
  FROM org_subscriptions os
  LEFT JOIN subscription_bundle_items sbi ON os.plan_id IS NULL AND sbi.bundle_id = os.bundle_id
  JOIN subscription_plans sp ON sp.id = COALESCE(os.plan_id, sbi.plan_id)
  JOIN sub_modules sm ON sm.module_id = sp.module_id
  WHERE os.organization_id = ?
    AND os.expiry_date <= ${TODAY_IST}
`

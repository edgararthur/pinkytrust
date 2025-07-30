-- Drop the view if it exists
DROP VIEW IF EXISTS organizations_with_stats;

-- Create organizations_with_stats view
CREATE OR REPLACE VIEW organizations_with_stats AS
SELECT 
  o.*,
  COALESCE(c.certificates_count, 0) as certificates_count,
  COALESCE(e.events_count, 0) as events_count,
  COALESCE(r.reports_count, 0) as reports_count,
  m.municipality_name,
  m.region_name
FROM 
  organizations o
LEFT JOIN (
  SELECT organization_id, COUNT(*) as certificates_count
  FROM certificates
  GROUP BY organization_id
) c ON o.id = c.organization_id
LEFT JOIN (
  SELECT organization_id, COUNT(*) as events_count
  FROM events
  GROUP BY organization_id
) e ON o.id = e.organization_id
LEFT JOIN (
  SELECT organization_id, COUNT(*) as reports_count
  FROM reports
  GROUP BY organization_id
) r ON o.id = r.organization_id
LEFT JOIN municipality_accounts m ON o.municipality_id = m.municipality_id;

-- Grant necessary permissions
GRANT SELECT ON organizations_with_stats TO authenticated, anon; 
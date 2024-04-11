SELECT * FROM mod_plum_v1."EmploymentPositionStaffing"
JOIN "mod_plum_v1"."EmploymentPosition" ON "EmploymentPositionStaffing"."employmentPositionId" = "EmploymentPosition"."id"
JOIN "mod_plum_v1"."Position" ON "EmploymentPosition"."positionId" = "Position"."id" 
JOIN "mod_plum_v1"."Role" ON "Position"."roleId" = "Role"."id" 
where "Role".name::jsonb #>> '{en,*}' = 'Orthodontist'
ORDER BY "EmploymentPosition".id ASC;
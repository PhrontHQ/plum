# plumming-data-worker

User Identity Design:

Cognito default quotas are 1000 user pools and 1000 app clients per pool.

We need 2 App clients per practice organization: 
    - ${organization.id}-plumming-tool - Used for headless processes, to export, monitor data in the background
    - ${organization.id}-plumming-workstation - Used for application running on computers in a practice and used by staff.

So that limits us to handling 500 customer organizations per user pool, knowing that quotas on actual users are really high and would never be a problem.

Cognito structure and relationships will be modeled in the database as well for better consistency and efficienty relating things together, which will allow us to find an Application based on it's id/secret and find the organization and pools it belongs to.

So once we provisioned 500 practices on the first cogent-design-customer-1 pool, we'll create a new pool , cogent-design-customer-2, grow it to 500 customers, and then move on to cogent-design-customer-3, etc...


We have a dedicated cogent-design user pool for Cogent Design, which will be first used to create an app client id that will be used to provision practice organizations in the plumming database, provision their app clients etc... and later to create users for Cogent Design's staff to use admin/configuration tools.


deploy using:
serverless deploy --stage staging 
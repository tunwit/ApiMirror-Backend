# Project tokens

New projects automatically get one token in the project creation transaction. The create response includes the raw token once. This feature owns generation, token metadata and regeneration using the existing `project_token` table.

Use the cookie-authenticated `GET /api/projects/:id/token` to read metadata and `POST /api/projects/:id/token/regenerate` to issue a replacement. Both check project ownership. Regeneration returns the new token once; subsequent GET requests return only its prefix and timestamps. A token cannot be revealed from its stored hash.

Deleting a project removes the token through the existing foreign key. No schema migration or frontend integration is added here. The public mock request handler and bearer-token verification are separate work.

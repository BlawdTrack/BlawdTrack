# Role access screen

The role matrix supports editing, resetting, and applying changes in the current
screen state. Super Usuario permissions remain read-only. Applied changes are
held in the frontend until the screen is reloaded.

The role catalog and actions are kept separate from the API client so the save
flow can be connected to the appropriate service when that integration is
ready.

# Profile editing

The `/profile` page edits the signed-in player's profile and shows a live preview. It saves the profile in the local SQLite database associated with the authenticated account.

Players can upload a JPEG, PNG, or WebP avatar up to 3 MB. The server checks the file signature and stores the image in `data/avatars`; profile data stores its URL. The local folder is ignored by Git. Hosted deployments need persistent disk or object storage for uploaded photos.

Profiles also support up to 12 search tags. Tags are case-insensitively deduplicated, shown on the public profile and player card, and matched by text search or the tag filter. Existing SQLite databases add the tags column automatically when the app starts.

Country is selected from a shared country list. Languages and "Looking for" activities are selected from shared multi-select lists; the player search filters use the same lists and also include values from existing profiles for compatibility.

Friend requests are stored in `player_friendships`. Players can send, accept, decline, or cancel requests and remove existing friends from `/friends`.

Private conversations are stored in `conversations` and `private_messages`. Registered players can start a conversation from another player's profile or from the `/messages` inbox; the open conversation refreshes every four seconds.

Party invitations are stored in `party_invites`. From a registered player's profile, choose a game and optional note; invitations can be accepted, declined, or cancelled from `/invites`.

The public `/players/[id]` page reads saved player profiles from SQLite. New accounts appear in player search after their profile is saved.

This local development setup stores data in `data/partyfind.sqlite` and uploaded images in `data/avatars`. It is not configured for production hosting yet.

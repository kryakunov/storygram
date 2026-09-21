<?php

function demo_profiles()
{
    return [
        [
            'username' => 'luna.travels',
            'displayName' => 'Luna Travels',
            'avatarUrl' => asset('demo/avatars/luna.svg'),
            'bio' => 'Public travel diary. Coastal light, trains, and late markets.',
            'isPublic' => true,
            'followerLabel' => '128k',
            'scenario' => 'stories',
            'notes' => 'Public profile with mixed image and video stories.',
            'stories' => [
                [
                    'id' => 'luna-sunrise',
                    'mediaType' => 'image',
                    'mediaUrl' => asset('demo/stories/luna-sunrise.svg'),
                    'thumbnailUrl' => asset('demo/stories/luna-sunrise.svg'),
                    'caption' => 'Sunrise over the ferry dock',
                    'createdHoursAgo' => 2,
                    'expiresInHours' => 22,
                ],
                [
                    'id' => 'luna-market',
                    'mediaType' => 'video',
                    'mediaUrl' => asset('demo/stories/demo-clip.mp4'),
                    'thumbnailUrl' => asset('demo/stories/luna-market.svg'),
                    'caption' => 'Night market walk-through',
                    'createdHoursAgo' => 5,
                    'expiresInHours' => 19,
                ],
                [
                    'id' => 'luna-train',
                    'mediaType' => 'image',
                    'mediaUrl' => asset('demo/stories/luna-train.svg'),
                    'thumbnailUrl' => asset('demo/stories/luna-train.svg'),
                    'caption' => 'Window seat, last carriage',
                    'createdHoursAgo' => 8,
                    'expiresInHours' => 16,
                ],
            ],
        ],
        [
            'username' => 'cafe.neon',
            'displayName' => 'Cafe Neon',
            'avatarUrl' => asset('demo/avatars/cafe.svg'),
            'bio' => 'Neighborhood coffee shop. Daily specials, public storefront only.',
            'isPublic' => true,
            'followerLabel' => '14k',
            'scenario' => 'stories',
            'notes' => 'Public profile with image-only stories.',
            'stories' => [
                [
                    'id' => 'cafe-pour',
                    'mediaType' => 'image',
                    'mediaUrl' => asset('demo/stories/cafe-pour.svg'),
                    'thumbnailUrl' => asset('demo/stories/cafe-pour.svg'),
                    'caption' => 'Oat cortado, extra foam',
                    'createdHoursAgo' => 1,
                    'expiresInHours' => 23,
                ],
                [
                    'id' => 'cafe-window',
                    'mediaType' => 'image',
                    'mediaUrl' => asset('demo/stories/cafe-window.svg'),
                    'thumbnailUrl' => asset('demo/stories/cafe-window.svg'),
                    'caption' => 'Rain on the shop window',
                    'createdHoursAgo' => 4,
                    'expiresInHours' => 20,
                ],
            ],
        ],
        [
            'username' => 'city.lights',
            'displayName' => 'City Lights',
            'avatarUrl' => asset('demo/avatars/city.svg'),
            'bio' => 'Public architecture walks after dark.',
            'isPublic' => true,
            'followerLabel' => '61k',
            'scenario' => 'stories',
            'notes' => 'Public profile with video-heavy stories.',
            'stories' => [
                [
                    'id' => 'city-bridge',
                    'mediaType' => 'video',
                    'mediaUrl' => asset('demo/stories/demo-clip.mp4'),
                    'thumbnailUrl' => asset('demo/stories/city-bridge.svg'),
                    'caption' => 'Bridge lights at 1am',
                    'createdHoursAgo' => 3,
                    'expiresInHours' => 21,
                ],
                [
                    'id' => 'city-metro',
                    'mediaType' => 'video',
                    'mediaUrl' => asset('demo/stories/demo-clip.mp4'),
                    'thumbnailUrl' => asset('demo/stories/city-metro.svg'),
                    'caption' => 'Metro line 4, last train',
                    'createdHoursAgo' => 6,
                    'expiresInHours' => 18,
                ],
                [
                    'id' => 'city-skyline',
                    'mediaType' => 'image',
                    'mediaUrl' => asset('demo/stories/city-skyline.svg'),
                    'thumbnailUrl' => asset('demo/stories/city-skyline.svg'),
                    'caption' => 'Fog on the high-rises',
                    'createdHoursAgo' => 9,
                    'expiresInHours' => 15,
                ],
            ],
        ],
        [
            'username' => 'quiet.garden',
            'displayName' => 'Quiet Garden',
            'avatarUrl' => asset('demo/avatars/garden.svg'),
            'bio' => 'Public botanical notes. Slow plants, no stories today.',
            'isPublic' => true,
            'followerLabel' => '3.2k',
            'scenario' => 'no_stories',
            'notes' => 'Public profile with no currently available stories.',
            'stories' => [],
        ],
        [
            'username' => 'private.mode',
            'displayName' => 'Private Mode',
            'avatarUrl' => asset('demo/avatars/private.svg'),
            'bio' => 'This account is private. The app must refuse it.',
            'isPublic' => false,
            'followerLabel' => 'hidden',
            'scenario' => 'private',
            'notes' => 'Private profile. Stories are never returned.',
            'stories' => [
                [
                    'id' => 'private-hidden',
                    'mediaType' => 'image',
                    'mediaUrl' => asset('demo/stories/private-hidden.svg'),
                    'thumbnailUrl' => asset('demo/stories/private-hidden.svg'),
                    'caption' => 'Should never be returned',
                    'createdHoursAgo' => 1,
                    'expiresInHours' => 23,
                ],
            ],
        ],
        [
            'username' => 'down.stream',
            'displayName' => 'Down Stream',
            'avatarUrl' => asset('demo/avatars/down.svg'),
            'bio' => 'Used to simulate provider downtime.',
            'isPublic' => true,
            'followerLabel' => '0',
            'scenario' => 'unavailable',
            'notes' => 'Simulates a temporary provider failure.',
            'stories' => [],
        ],
    ];
}

function find_demo_profile($username)
{
    $needle = strtolower((string) $username);
    foreach (demo_profiles() as $profile) {
        if ($profile['username'] === $needle) {
            return $profile;
        }
    }
    return null;
}

function public_profile_from_seed(array $seed)
{
    return [
        'username' => $seed['username'],
        'displayName' => $seed['displayName'],
        'avatarUrl' => $seed['avatarUrl'],
        'bio' => $seed['bio'],
        'isPublic' => (bool) $seed['isPublic'],
        'followerLabel' => $seed['followerLabel'],
    ];
}

function public_stories_from_seed(array $seed, $now = null)
{
    $now = $now ?: time();
    $stories = [];
    foreach ($seed['stories'] as $story) {
        $stories[] = [
            'providerStoryId' => $story['id'],
            'mediaType' => $story['mediaType'],
            'mediaUrl' => $story['mediaUrl'],
            'thumbnailUrl' => $story['thumbnailUrl'],
            'caption' => $story['caption'],
            'createdAtRemote' => gmdate('c', $now - $story['createdHoursAgo'] * 3600),
            'expiresAtRemote' => gmdate('c', $now + $story['expiresInHours'] * 3600),
        ];
    }
    return $stories;
}

<?php

class MockProvider
{
    public $name = 'mock';

    public function getProfileByUsername($username)
    {
        $seed = find_demo_profile($username);
        if (!$seed) {
            return ['status' => 'not_found'];
        }
        if ($seed['scenario'] === 'unavailable') {
            throw new RuntimeException('Mock provider simulated an upstream outage for down.stream');
        }
        if ($seed['scenario'] === 'private' || !$seed['isPublic']) {
            return ['status' => 'private_profile', 'profile' => public_profile_from_seed($seed)];
        }
        return ['status' => 'found', 'profile' => public_profile_from_seed($seed)];
    }

    public function getActiveStories($username)
    {
        $seed = find_demo_profile($username);
        if (!$seed) {
            return ['status' => 'not_found'];
        }
        if ($seed['scenario'] === 'unavailable') {
            return [
                'status' => 'provider_unavailable',
                'message' => 'Mock provider simulated an upstream outage for down.stream',
            ];
        }
        if ($seed['scenario'] === 'private' || !$seed['isPublic']) {
            return ['status' => 'private_profile'];
        }
        $now = time();
        $stories = array_values(array_filter(public_stories_from_seed($seed, $now), function ($story) use ($now) {
            return strtotime($story['expiresAtRemote']) > $now;
        }));
        if (!$stories) {
            return ['status' => 'no_stories'];
        }
        return ['status' => 'found', 'stories' => $stories];
    }

    public function healthCheck()
    {
        return [
            'name' => $this->name,
            'ok' => true,
            'message' => 'Mock provider is local and always healthy.',
            'checkedAt' => gmdate('c'),
        ];
    }
}

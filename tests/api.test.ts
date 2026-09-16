import assert from 'node:assert';
import app from '../src/server.js';
import { db } from '../src/db/database.js';
import { MovieCatalogService } from '../src/services/movieCatalogService.js';
import { ConversationService } from '../src/services/conversationService.js';
import { RecommendationEngine } from '../src/services/recommendationEngine.js';
import { WatchlistService } from '../src/services/watchlistService.js';
import { DiscoverService } from '../src/services/discoverService.js';

let server: any;
const TEST_PORT = 3899;
const BASE_URL = `http://localhost:${TEST_PORT}`;

async function runTests() {
  console.log('🧪 Starting CineMatch Comprehensive Automated Test Suite...\n');
  let passed = 0;
  let failed = 0;

  try {
    server = app.listen(TEST_PORT);

    // Test 1: Anonymous Auth
    console.log('Test 1: POST /api/auth/anonymous');
    const authRes = await fetch(`${BASE_URL}/api/auth/anonymous`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const authData = await authRes.json();
    assert.strictEqual(authRes.status, 200);
    assert.ok(authData.user?.id, 'User ID should be generated');
    const userId = authData.user.id;
    console.log(`  ✓ Created anonymous user: ${userId}`);
    passed++;

    // Test 2: Create Session & Preference State
    console.log('\nTest 2: POST /api/sessions');
    const sessionRes = await fetch(`${BASE_URL}/api/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, title: 'Test Sci-Fi Session' })
    });
    const sessionData = await sessionRes.json();
    assert.strictEqual(sessionRes.status, 201);
    assert.ok(sessionData.session?.id, 'Session ID should be created');
    assert.strictEqual(sessionData.session.user_id, userId);
    const sessionId = sessionData.session.id;
    console.log(`  ✓ Created session: ${sessionId}`);
    passed++;

    // Test 3: Direct Update Preference State
    console.log('\nTest 3: PATCH /api/sessions/:id/preferences');
    const prefRes = await fetch(`${BASE_URL}/api/sessions/${sessionId}/preferences`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mood_tags: ['mind-bending'],
        genre_tags: ['Sci-Fi'],
        platform_filters: ['Netflix'],
        max_runtime_minutes: 150
      })
    });
    const prefData = await prefRes.json();
    assert.strictEqual(prefRes.status, 200);
    assert.deepStrictEqual(prefData.preference_state.mood_tags, ['mind-bending']);
    assert.deepStrictEqual(prefData.preference_state.platform_filters, ['Netflix']);
    assert.strictEqual(prefData.preference_state.max_runtime_minutes, 150);
    console.log('  ✓ Updated preference state pills directly');
    passed++;

    // Test 4: Recommendation Engine & Zero-Hallucination Guarantee
    console.log('\nTest 4: POST /api/sessions/:id/messages (Chat & Recommendation Pipeline)');
    const msgRes = await fetch(`${BASE_URL}/api/sessions/${sessionId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'I want a mind-bending sci-fi movie with great twists on Netflix' })
    });
    const msgData = await msgRes.json();
    assert.strictEqual(msgRes.status, 200);
    assert.ok(msgData.message?.content, 'Assistant message content should exist');
    assert.ok(Array.isArray(msgData.recommendations), 'Recommendations should be an array');
    assert.ok(msgData.recommendations.length > 0, 'Should return at least 1 recommendation');

    // Zero-hallucination verification
    for (const rec of msgData.recommendations) {
      assert.ok(rec.movie_id, 'Recommendation must have movie_id');
      const movieInCatalog = MovieCatalogService.getMovieById(rec.movie_id);
      assert.ok(movieInCatalog, `Verified movie ID '${rec.movie_id}' must exist in catalog`);
      assert.ok(rec.match_score >= 50 && rec.match_score <= 100, 'Match score must be between 50 and 100');
      assert.ok(rec.reason_text.length > 5, 'Must have reason text');
      console.log(`    → Verified pick: "${movieInCatalog.title}" (${movieInCatalog.year}) - ${rec.match_score}% match`);
    }

    assert.ok(Array.isArray(msgData.quick_replies), 'Quick replies should be generated');
    assert.ok(msgData.quick_replies.length > 0, 'At least one quick reply chip');
    console.log(`  ✓ Zero-hallucination test passed (${msgData.recommendations.length} verified picks)`);
    passed++;

    // Test 5: Watchlist CRUD Lifecycle
    console.log('\nTest 5: Watchlist Service (Add, List, Status Update, Delete)');
    const testMovieId = msgData.recommendations[0].movie_id;

    // 5a. Add to watchlist
    const addWatchRes = await fetch(`${BASE_URL}/api/watchlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, movie_id: testMovieId, status: 'to_watch' })
    });
    const addWatchData = await addWatchRes.json();
    assert.strictEqual(addWatchRes.status, 201);
    const watchItemId = addWatchData.item.id;
    console.log(`  ✓ Added movie '${testMovieId}' to watchlist (Item ID: ${watchItemId})`);

    // 5b. List watchlist
    const listWatchRes = await fetch(`${BASE_URL}/api/watchlist?user_id=${userId}`);
    const listWatchData = await listWatchRes.json();
    assert.strictEqual(listWatchRes.status, 200);
    assert.strictEqual(listWatchData.watchlist.length, 1);
    assert.strictEqual(listWatchData.watchlist[0].movie_id, testMovieId);
    console.log('  ✓ Listed watchlist successfully');

    // 5c. Update status to 'watched'
    const patchWatchRes = await fetch(`${BASE_URL}/api/watchlist/${watchItemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, status: 'watched' })
    });
    const patchWatchData = await patchWatchRes.json();
    assert.strictEqual(patchWatchRes.status, 200);
    assert.strictEqual(patchWatchData.item.status, 'watched');
    console.log('  ✓ Updated watchlist item status to "watched"');

    // 5d. Delete from watchlist
    const delWatchRes = await fetch(`${BASE_URL}/api/watchlist/${watchItemId}?user_id=${userId}`, {
      method: 'DELETE'
    });
    const delWatchData = await delWatchRes.json();
    assert.strictEqual(delWatchRes.status, 200);
    assert.strictEqual(delWatchData.success, true);
    console.log('  ✓ Removed item from watchlist');
    passed++;

    // Test 6: Discover Mood Presets
    console.log('\nTest 6: GET /api/discover/moods');
    const discoverRes = await fetch(`${BASE_URL}/api/discover/moods`);
    const discoverData = await discoverRes.json();
    assert.strictEqual(discoverRes.status, 200);
    assert.ok(Array.isArray(discoverData.presets), 'Presets should be an array');
    assert.ok(discoverData.presets.length >= 6, 'Should return at least 6 curated mood presets');
    console.log(`  ✓ Fetched ${discoverData.presets.length} curated mood presets`);
    passed++;

    // Test 7: Mood Spark ("Surprise Me")
    console.log('\nTest 7: POST /api/sessions/:id/surprise (Mood Spark)');
    const surpriseRes = await fetch(`${BASE_URL}/api/sessions/${sessionId}/surprise`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const surpriseData = await surpriseRes.json();
    assert.strictEqual(surpriseRes.status, 200);
    assert.ok(surpriseData.recommendations.length > 0, 'Surprise endpoint should return recommendations');
    console.log(`  ✓ Generated ${surpriseData.recommendations.length} instant surprise recommendations`);
    passed++;

    // Test 8: List User Sessions (History)
    console.log('\nTest 8: GET /api/sessions?user_id=...');
    const histRes = await fetch(`${BASE_URL}/api/sessions?user_id=${userId}`);
    const histData = await histRes.json();
    assert.strictEqual(histRes.status, 200);
    assert.ok(histData.sessions.length >= 1, 'Should find user session in history');
    console.log(`  ✓ Found ${histData.sessions.length} session(s) in History tab`);
    passed++;

    console.log(`\n========================================`);
    console.log(`🎉 ALL ${passed} AUTOMATED TESTS PASSED SUCCESSFULLY!`);
    console.log(`========================================\n`);
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Test failed with error:', err);
    failed++;
  } finally {
    if (server) {
      server.close();
    }
    if (failed > 0) {
      process.exit(1);
    }
  }
}

runTests();

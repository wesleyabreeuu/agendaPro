<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Goals\StoreGoalProgressRequest;
use App\Http\Requests\Goals\StoreGoalRequest;
use App\Http\Requests\Goals\UpdateGoalRequest;
use App\Models\Goal;
use App\Services\GoalAnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class GoalController extends Controller
{
    public function index(GoalAnalyticsService $analytics): JsonResponse
    {
        $goals = Goal::ownedBy(Auth::id())
            ->with(['milestones', 'progress'])
            ->latest()
            ->get()
            ->map(fn (Goal $goal) => [
                'id' => $goal->id,
                'titulo' => $goal->titulo,
                'status' => $goal->status,
                'tipo_meta' => $goal->tipo_meta,
                'percentual_conclusao' => $analytics->indicators($goal)['percentual_conclusao'],
            ]);

        return response()->json(['data' => $goals]);
    }

    public function store(StoreGoalRequest $request): JsonResponse
    {
        $goal = Goal::create([
            ...$request->safe()->except(['rotina_ids', 'milestones']),
            'user_id' => Auth::id(),
        ]);

        return response()->json(['data' => $goal], 201);
    }

    public function show(Goal $goal, GoalAnalyticsService $analytics): JsonResponse
    {
        $this->authorize('view', $goal);
        $goal->load(['milestones', 'progress', 'rotinas']);

        return response()->json([
            'data' => $goal,
            'indicators' => $analytics->indicators($goal),
        ]);
    }

    public function update(UpdateGoalRequest $request, Goal $goal): JsonResponse
    {
        $this->authorize('update', $goal);
        $goal->update($request->safe()->except(['rotina_ids', 'milestones']));

        return response()->json(['data' => $goal->fresh()]);
    }

    public function destroy(Goal $goal): JsonResponse
    {
        $this->authorize('delete', $goal);
        $goal->delete();

        return response()->json(status: 204);
    }

    public function storeProgress(StoreGoalProgressRequest $request, Goal $goal): JsonResponse
    {
        $this->authorize('update', $goal);
        $progress = $goal->progress()->create($request->validated());

        return response()->json(['data' => $progress], 201);
    }
}

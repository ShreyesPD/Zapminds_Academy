<script lang="ts" setup>
import type { LeaderboardEntry } from "~/types/academy";

interface Props {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

const props = defineProps<Props>();

const getRankDisplay = (rank: number) => {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `#${rank}`;
};
</script>

<template>
  <div :class="$style.container">
    <table :class="$style.table">
      <thead>
        <tr>
          <th :class="$style.rankCol">Rank</th>
          <th :class="$style.userCol">User</th>
          <th :class="$style.pointsCol">Points</th>
          <th :class="$style.challengesCol">Challenges</th>
          <th :class="$style.streakCol">Streak</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="entry in entries"
          :key="entry.user_id"
          :class="[
            $style.row,
            entry.user_id === currentUserId && $style.currentUser,
          ]"
        >
          <td :class="$style.rankCol">
            <span :class="$style.rank">{{ getRankDisplay(entry.rank) }}</span>
          </td>
          <td :class="$style.userCol">
            <div :class="$style.userInfo">
              <span :class="$style.email">{{ entry.email }}</span>
              <span v-if="entry.designation" :class="$style.designation">
                {{ entry.designation }}
              </span>
            </div>
          </td>
          <td :class="$style.pointsCol">
            <strong>{{ entry.total_points }}</strong>
          </td>
          <td :class="$style.challengesCol">{{ entry.challenges_completed }}</td>
          <td :class="$style.streakCol">
            <span :class="$style.streak">🔥 {{ entry.current_streak }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style module lang="scss">
.container {
  border: 2px solid var(--foreground-color);
  border-radius: 0.5rem;
  overflow: hidden;
  background: var(--background-color);
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-family: var(--text-font);
}

thead {
  background: var(--foreground-color);
  color: var(--background-color);
}

th {
  padding: 1rem;
  text-align: left;
  font-family: var(--display-font);
  text-transform: uppercase;
  font-size: 0.875rem;
  font-weight: 600;
}

tbody tr {
  border-bottom: 1px solid var(--foreground-color);
  transition: background 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  &:last-child {
    border-bottom: none;
  }
}

.currentUser {
  background: rgba(16, 185, 129, 0.1);
  font-weight: 600;
}

td {
  padding: 1rem;
  font-size: 0.9375rem;
}

.rankCol {
  width: 80px;
  text-align: center;
}

.rank {
  font-size: 1.25rem;
  font-weight: 600;
}

.userCol {
  min-width: 200px;
}

.userInfo {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.email {
  font-weight: 500;
}

.designation {
  font-size: 0.8125rem;
  opacity: 0.7;
}

.pointsCol {
  width: 100px;
  text-align: center;
}

.challengesCol {
  width: 120px;
  text-align: center;
}

.streakCol {
  width: 100px;
  text-align: center;
}

.streak {
  font-weight: 600;
}

@media (max-width: 768px) {
  .table {
    font-size: 0.875rem;
  }

  th,
  td {
    padding: 0.75rem 0.5rem;
  }

  .designation {
    display: none;
  }
}
</style>


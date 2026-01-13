<template>
    <div class="container-fluid py-4 vh-100 d-flex flex-column">
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h1>Timeslot Details</h1>
            <router-link :to="{ name: 'timeslots', params: { theaterId, roomId } }" class="btn btn-outline-secondary">
                ← Back to Timeslots
            </router-link>
        </div>

        <div v-if="isLoading" class="text-center py-5">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>

        <div v-else class="row flex-grow-1 overflow-hidden">
            <div class="col-lg-8 d-flex flex-column overflow-auto">
                <div class="card mb-3">
                    <div class="card-body">
                        <h3 class="card-title">{{ movie?.name || 'Loading...' }}</h3>
                        <div class="row">
                            <div class="col-md-6">
                                <p class="mb-1"><strong>Theater:</strong> {{ theater?.name || 'N/A' }}</p>
                                <p class="mb-1"><strong>Room:</strong> {{ room?.name || 'N/A' }}</p>
                                <p class="mb-1">
                                    <strong>Capacity:</strong> {{ room?.rows || 0 }} rows × {{ room?.columns || 0 }}
                                    columns
                                </p>
                            </div>
                            <div class="col-md-6">
                                <p class="mb-1"><strong>Start:</strong> {{ formatTime(timeslot?.start_time) }}</p>
                                <p class="mb-1"><strong>End:</strong> {{ formatTime(timeslot?.end_time) }}</p>
                                <p class="mb-1">
                                    <strong>Duration:</strong>
                                    {{ calculateDuration(timeslot?.start_time, timeslot?.end_time) }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card mb-3">
                    <div class="card-body py-2">
                        <div class="d-flex justify-content-center gap-4">
                            <div class="d-flex align-items-center">
                                <div class="border border-2 rounded me-2" style="width: 30px; height: 30px"></div>
                                <small>Available</small>
                            </div>
                            <div class="d-flex align-items-center">
                                <div class="bg-danger border border-danger border-2 rounded me-2"
                                    style="width: 30px; height: 30px"></div>
                                <small>Reserved</small>
                            </div>
                            <div class="d-flex align-items-center">
                                <div class="bg-success border border-success border-2 rounded me-2"
                                    style="width: 30px; height: 30px"></div>
                                <small>Selected</small>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card flex-grow-1 d-flex flex-column">
                    <div class="card-header">
                        <h5 class="mb-0">Seat Map</h5>
                    </div>
                    <div class="card-body overflow-auto">
                        <div class="text-center mb-3">
                            <div class="badge bg-secondary p-2">SCREEN</div>
                        </div>
                        <div class="d-flex flex-column gap-2 mx-auto" style="width: fit-content">
                            <div v-for="row in room?.rows || 0" :key="row" class="d-flex align-items-center gap-2">
                                <span class="text-end fw-bold text-secondary" style="width: 30px">{{ row }}</span>
                                <button v-for="col in room?.columns || 0" :key="`${row}-${col}`" type="button" :class="[
                                    'btn btn-sm border border-2 rounded',
                                    {
                                        'btn-outline-secondary':
                                            !isSeatReserved(row, col) && !isSeatSelected(row, col),
                                        'btn-danger': isSeatReserved(row, col),
                                        'btn-success': isSeatSelected(row, col),
                                    },
                                ]" @click="toggleSeat(row, col)" style="width: 40px; height: 40px; font-size: 12px; padding: 0">
                                    {{ col }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-lg-4 d-flex flex-column overflow-hidden">
                <div class="card h-100 d-flex flex-column">
                    <div class="card-header">
                        <h5 class="mb-0">Reservations</h5>
                    </div>
                    <div class="card-body overflow-auto flex-grow-1">
                        <div v-if="selectedSeats.length > 0" class="mb-3">
                            <h6 class="mb-2">Selected Seats</h6>
                            <div class="mb-2 d-flex flex-wrap gap-1">
                                <span v-for="seat in selectedSeats" :key="`${seat.row}-${seat.col}`"
                                    class="badge bg-primary">
                                    {{ seat.row }}-{{ seat.col }}
                                </span>
                            </div>
                            <button class="btn btn-success btn-sm w-100"
                                :disabled="createReservationMutation.isPending.value || hasReservedSeatsSelected"
                                @click="createReservations">
                                <span v-if="createReservationMutation.isPending.value"
                                    class="spinner-border spinner-border-sm me-2"></span>
                                Create ({{ selectedSeats.length }})
                            </button>
                            <hr class="my-3" />
                        </div>

                        <div>
                            <h6 class="mb-2">Selected Reservations</h6>
                            <div v-if="reservationsQuery.isLoading.value" class="text-center py-3">
                                <div class="spinner-border spinner-border-sm" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                            </div>
                            <div v-else-if="selectedSeats.length === 0" class="text-muted small">
                                Select a seat to view its reservation.
                            </div>
                            <div v-else-if="selectedReservations.length === 0" class="text-muted small">
                                Selected seats have no reservations yet.
                            </div>
                            <div v-else>
                                <div v-for="reservation in selectedReservations" :key="reservation.id"
                                    class="card mb-2">
                                    <div class="card-body p-2">
                                        <div class="d-flex justify-content-between align-items-start">
                                            <div>
                                                <strong>Seat {{ reservation.row }}-{{ reservation.col }}</strong>
                                                <br />
                                                <small class="text-muted">
                                                    <span class="badge bg-info">{{ reservation.type }}</span>
                                                    {{ formatTime(reservation.created_at) }}
                                                </small>
                                            </div>
                                            <router-link :to="{
                                                name: 'purchases',
                                                params: { reservationId: reservation.id },
                                            }" class="btn btn-sm btn-outline-primary">
                                                Purchases
                                            </router-link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ApiReservationRequestType, type ApiReservationResponse } from '@/api/nakup/model';
import { useReservationsCreate, useReservationsList } from '@/api/nakup/reservations/reservations';
import { useMoviesShow } from '@/api/spored/movies/movies';
import { useRoomsShow } from '@/api/spored/rooms/rooms';
import { useTheatersShow } from '@/api/spored/theaters/theaters';
import { useTimeSlotsShow } from '@/api/spored/timeslots/timeslots';
import { calculateDuration, formatTime } from '@/util/time';
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const theaterId = computed(() => route.params.theaterId as string);
const roomId = computed(() => route.params.roomId as string);
const timeslotId = computed(() => route.params.timeslotId as string);

const timeslotQuery = useTimeSlotsShow(theaterId, roomId, timeslotId);
const roomQuery = useRoomsShow(theaterId, roomId);
const theaterQuery = useTheatersShow(theaterId);
const reservationsQuery = useReservationsList(undefined, { query: { refetchInterval: 5000 } });

const timeslot = computed(() => timeslotQuery.data.value);
const room = computed(() => roomQuery.data.value);
const theater = computed(() => theaterQuery.data.value);

const movieId = computed(() => timeslot.value?.movie_id);
const movieQuery = useMoviesShow(
    computed(() => movieId.value || ''),
    {
        query: {
            enabled: computed(() => !!movieId.value),
        },
    },
);
const movie = computed(() => movieQuery.data.value);

const isLoading = computed(
    () => timeslotQuery.isLoading.value || roomQuery.isLoading.value || theaterQuery.isLoading.value,
);

const allReservations = computed(() => {
    return (reservationsQuery.data.value?.data || []) as ApiReservationResponse[];
});

const activeReservations = computed(() => {
    return allReservations.value.filter((r) => r.time_slot_id === timeslotId.value);
});

const selectedReservations = computed(() => {
    return selectedSeats.value
        .map((seat) => activeReservations.value.find((r) => r.row === seat.row && r.col === seat.col))
        .filter(Boolean) as ApiReservationResponse[];
});

const hasReservedSeatsSelected = computed(() => {
    return selectedSeats.value.some((seat) => isSeatReserved(seat.row, seat.col));
});

const selectedSeats = ref<Array<{ row: number; col: number; }>>([]);

function isSeatReserved(row: number, col: number): boolean {
    return activeReservations.value.some((r) => r.row === row && r.col === col);
}

function isSeatSelected(row: number, col: number): boolean {
    return selectedSeats.value.some((s) => s.row === row && s.col === col);
}

function toggleSeat(row: number, col: number): void {
    const index = selectedSeats.value.findIndex((s) => s.row === row && s.col === col);
    if (index >= 0) {
        selectedSeats.value.splice(index, 1);
    } else {
        selectedSeats.value.push({ row, col });
    }
}

const createReservationMutation = useReservationsCreate();

async function createReservations(): Promise<void> {
    try {
        const seatsToCreate = selectedSeats.value.filter((seat) => !isSeatReserved(seat.row, seat.col));

        for (const seat of seatsToCreate) {
            await createReservationMutation.mutateAsync({
                data: {
                    row: seat.row,
                    col: seat.col,
                    theater_id: theaterId.value,
                    room_id: roomId.value,
                    time_slot_id: timeslotId.value,
                    type: ApiReservationRequestType.POS,
                },
            });
        }
        selectedSeats.value = [];
        await reservationsQuery.refetch();
    } catch (error) {
        console.error('Failed to create reservations:', error);
    }
}
</script>

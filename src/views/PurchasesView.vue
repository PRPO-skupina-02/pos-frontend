<template>
    <div class="container-fluid py-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>Reservation Details</h1>
            <button class="btn btn-outline-secondary" @click="goBack">← Back</button>
        </div>

        <div v-if="isLoading" class="text-center py-5">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>

        <div v-else-if="error" class="alert alert-danger">
            Error loading reservation: {{ error.message }}
        </div>

        <div v-else-if="reservation" class="row">
            <div class="col-md-6 mb-4">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">Reservation Information</h5>
                        <div>
                            <button class="btn btn-sm btn-primary me-2" @click="showEditReservationModal">
                                Edit
                            </button>
                            <button class="btn btn-sm btn-danger" @click="handleDeleteReservation"
                                :disabled="deleteReservationMutation.isPending.value">
                                <span v-if="deleteReservationMutation.isPending.value"
                                    class="spinner-border spinner-border-sm me-1"></span>
                                Delete
                            </button>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="row mb-2">
                            <div class="col-6"><strong>Seat:</strong></div>
                            <div class="col-6">Row {{ reservation.row }}, Col {{ reservation.col }}</div>
                        </div>
                        <div class="row mb-2">
                            <div class="col-6"><strong>Type:</strong></div>
                            <div class="col-6">
                                <span class="badge bg-info">{{ reservation.type }}</span>
                            </div>
                        </div>
                        <div class="row mb-2">
                            <div class="col-6"><strong>Created:</strong></div>
                            <div class="col-6">{{ formatTime(reservation.created_at) }}</div>
                        </div>
                        <div class="row">
                            <div class="col-6"><strong>ID:</strong></div>
                            <div class="col-6">
                                <small class="text-muted">{{ reservation.id }}</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-md-6 mb-4">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">Purchases</h5>
                        <button class="btn btn-sm btn-success" @click="showCreatePurchaseModal">
                            + Add Purchase
                        </button>
                    </div>
                    <div class="card-body">
                        <div v-if="purchasesQuery.isLoading.value" class="text-center py-3">
                            <div class="spinner-border spinner-border-sm"></div>
                        </div>
                        <div v-else-if="purchases.length === 0" class="text-muted text-center py-3">
                            No purchases yet
                        </div>
                        <div v-else class="list-group list-group-flush">
                            <div v-for="purchase in purchases" :key="purchase.id"
                                class="list-group-item d-flex justify-content-between align-items-start">
                                <div class="flex-grow-1">
                                    <h6 class="mb-1">{{ purchase.name }}</h6>
                                    <small class="text-muted">
                                        <span class="badge bg-secondary me-1">{{ purchase.type }}</span>
                                        {{ purchase.count }}x @ €{{ formatPrice(purchase.price_per_item_cents) }} = €{{
                                            formatPrice((purchase.price_per_item_cents || 0) * (purchase.count || 0))
                                        }}
                                    </small>
                                </div>
                                <div>
                                    <button class="btn btn-sm btn-outline-primary me-1"
                                        @click="showEditPurchaseModal(purchase)">
                                        Edit
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger"
                                        @click="handleDeletePurchase(purchase.id!)"
                                        :disabled="deletePurchaseMutation.isPending.value">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div v-if="purchases.length > 0" class="mt-3 pt-3 border-top">
                            <div class="d-flex justify-content-between">
                                <strong>Total:</strong>
                                <strong>€{{ formatPrice(totalAmount) }}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="showReservationModal" class="modal show d-block" tabindex="-1" @click.self="closeReservationModal">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Edit Reservation</h5>
                        <button type="button" class="btn-close" @click="closeReservationModal"></button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="handleUpdateReservation">
                            <div class="mb-3">
                                <label class="form-label">Row</label>
                                <input v-model.number="reservationForm.row" type="number" class="form-control" required
                                    min="1" />
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Column</label>
                                <input v-model.number="reservationForm.col" type="number" class="form-control" required
                                    min="1" />
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Type</label>
                                <select v-model="reservationForm.type" class="form-select" required>
                                    <option value="ONLINE">Online</option>
                                    <option value="POS">POS</option>
                                </select>
                            </div>
                            <div class="d-flex justify-content-end gap-2">
                                <button type="button" class="btn btn-secondary" @click="closeReservationModal">
                                    Cancel
                                </button>
                                <button type="submit" class="btn btn-primary"
                                    :disabled="updateReservationMutation.isPending.value">
                                    <span v-if="updateReservationMutation.isPending.value"
                                        class="spinner-border spinner-border-sm me-1"></span>
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="showPurchaseModal" class="modal show d-block" tabindex="-1" @click.self="closePurchaseModal">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">{{ editingPurchase ? 'Edit' : 'Add' }} Purchase</h5>
                        <button type="button" class="btn-close" @click="closePurchaseModal"></button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="handleSavePurchase">
                            <div class="mb-3">
                                <label class="form-label">Name</label>
                                <input v-model="purchaseForm.name" type="text" class="form-control" required
                                    minlength="3" />
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Type</label>
                                <select v-model="purchaseForm.type" class="form-select" required>
                                    <option :value="ApiPurchaseRequestType.FOOD">Food</option>
                                    <option :value="ApiPurchaseRequestType.DRINK">Drink</option>
                                    <option :value="ApiPurchaseRequestType.SNACK">Snack</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Price per Item (€)</label>
                                <input v-model.number="purchaseFormPrice" type="number" step="0.01" class="form-control"
                                    required min="0" />
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Count</label>
                                <input v-model.number="purchaseForm.count" type="number" class="form-control" required
                                    min="1" />
                            </div>
                            <div class="alert alert-info">
                                <strong>Total:</strong> €{{
                                    formatPrice(purchaseForm.price_per_item_cents * purchaseForm.count)
                                }}
                            </div>
                            <div class="d-flex justify-content-end gap-2">
                                <button type="button" class="btn btn-secondary" @click="closePurchaseModal">
                                    Cancel
                                </button>
                                <button type="submit" class="btn btn-primary" :disabled="createPurchaseMutation.isPending.value || updatePurchaseMutation.isPending.value
                                    ">
                                    <span v-if="
                                        createPurchaseMutation.isPending.value ||
                                        updatePurchaseMutation.isPending.value
                                    " class="spinner-border spinner-border-sm me-1"></span>
                                    {{ editingPurchase ? 'Save Changes' : 'Add Purchase' }}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="showReservationModal || showPurchaseModal" class="modal-backdrop show"></div>
    </div>
</template>

<script setup lang="ts">
import {
    ApiPurchaseRequestType,
    ApiReservationRequestType,
    type ApiPurchaseResponse,
} from '@/api/nakup/model';
import {
    usePurchasesCreate,
    usePurchasesDelete,
    usePurchasesList,
    usePurchasesUpdate,
} from '@/api/nakup/purchases/purchases';
import {
    useReservationsDelete,
    useReservationsShow,
    useReservationsUpdate,
} from '@/api/nakup/reservations/reservations';
import { formatTime } from '@/util/time';
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const reservationId = computed(() => route.params.reservationId as string);

const {
    data: reservationData,
    isLoading,
    error,
    refetch: refetchReservation,
} = useReservationsShow(reservationId);

const reservation = computed(() => reservationData.value);

const purchasesQuery = usePurchasesList(reservationId);

const purchases = computed(() => {
    return (purchasesQuery.data.value?.data || []) as ApiPurchaseResponse[];
});

const totalAmount = computed(() => {
    return purchases.value.reduce((sum, p) => {
        return sum + (p.price_per_item_cents || 0) * (p.count || 0);
    }, 0);
});

const updateReservationMutation = useReservationsUpdate();
const deleteReservationMutation = useReservationsDelete();
const createPurchaseMutation = usePurchasesCreate();
const updatePurchaseMutation = usePurchasesUpdate();
const deletePurchaseMutation = usePurchasesDelete();

const showReservationModal = ref(false);
const reservationForm = ref({
    row: 1,
    col: 1,
    type: 'POS' as 'ONLINE' | 'POS',
});

function showEditReservationModal() {
    if (!reservation.value) return;
    reservationForm.value = {
        row: reservation.value.row || 1,
        col: reservation.value.col || 1,
        type: (reservation.value.type as 'ONLINE' | 'POS') || 'POS',
    };
    showReservationModal.value = true;
}

function closeReservationModal() {
    showReservationModal.value = false;
}

async function handleUpdateReservation() {
    if (!reservation.value?.time_slot_id) return;

    const theaterId = route.params.theaterId as string | undefined;
    const roomId = route.params.roomId as string | undefined;

    if (!theaterId || !roomId) {
        alert('Cannot update reservation: missing theater or room information');
        return;
    }

    try {
        await updateReservationMutation.mutateAsync({
            reservationID: reservationId.value,
            data: {
                row: reservationForm.value.row,
                col: reservationForm.value.col,
                type:
                    reservationForm.value.type === 'ONLINE'
                        ? ApiReservationRequestType.ONLINE
                        : ApiReservationRequestType.POS,
                theater_id: theaterId,
                room_id: roomId,
                time_slot_id: reservation.value.time_slot_id,
            },
        });
        await refetchReservation();
        closeReservationModal();
    } catch (error) {
        console.error('Failed to update reservation:', error);
        alert('Failed to update reservation. Please try again.');
    }
}

async function handleDeleteReservation() {
    if (!confirm('Are you sure you want to delete this reservation?')) return;

    try {
        await deleteReservationMutation.mutateAsync({ reservationID: reservationId.value });
        router.back();
    } catch (error) {
        console.error('Failed to delete reservation:', error);
        alert('Failed to delete reservation. Please try again.');
    }
}

const showPurchaseModal = ref(false);
const editingPurchase = ref<ApiPurchaseResponse | null>(null);
const purchaseForm = ref<{
    name: string;
    type: ApiPurchaseRequestType;
    price_per_item_cents: number;
    count: number;
}>({
    name: '',
    type: ApiPurchaseRequestType.FOOD,
    price_per_item_cents: 0,
    count: 1,
});

const purchaseFormPrice = computed({
    get: () => purchaseForm.value.price_per_item_cents / 100,
    set: (value: number) => {
        purchaseForm.value.price_per_item_cents = Math.round(value * 100);
    },
});

function showCreatePurchaseModal() {
    editingPurchase.value = null;
    purchaseForm.value = {
        name: '',
        type: ApiPurchaseRequestType.FOOD,
        price_per_item_cents: 0,
        count: 1,
    };
    showPurchaseModal.value = true;
}

function showEditPurchaseModal(purchase: ApiPurchaseResponse) {
    editingPurchase.value = purchase;
    purchaseForm.value = {
        name: purchase.name || '',
        type: (purchase.type as ApiPurchaseRequestType) || ApiPurchaseRequestType.FOOD,
        price_per_item_cents: purchase.price_per_item_cents || 0,
        count: purchase.count || 1,
    };
    showPurchaseModal.value = true;
}

function closePurchaseModal() {
    showPurchaseModal.value = false;
    editingPurchase.value = null;
}

async function handleSavePurchase() {
    try {
        if (editingPurchase.value) {
            await updatePurchaseMutation.mutateAsync({
                reservationID: reservationId.value,
                purchaseID: editingPurchase.value.id!,
                data: purchaseForm.value,
            });
        } else {
            await createPurchaseMutation.mutateAsync({
                reservationID: reservationId.value,
                data: purchaseForm.value,
            });
        }
        await purchasesQuery.refetch();
        closePurchaseModal();
    } catch (error) {
        console.error('Failed to save purchase:', error);
        alert('Failed to save purchase. Please try again.');
    }
}

async function handleDeletePurchase(purchaseId: string) {
    if (!confirm('Are you sure you want to delete this purchase?')) return;

    try {
        await deletePurchaseMutation.mutateAsync({
            reservationID: reservationId.value,
            purchaseID: purchaseId,
        });
        await purchasesQuery.refetch();
    } catch (error) {
        console.error('Failed to delete purchase:', error);
        alert('Failed to delete purchase. Please try again.');
    }
}

function formatPrice(cents: number | undefined): string {
    if (cents === undefined) return '0.00';
    return (cents / 100).toFixed(2);
}

function goBack() {
    router.back();
}
</script>

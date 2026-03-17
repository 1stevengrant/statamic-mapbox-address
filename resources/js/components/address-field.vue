<template>
    <div
        class="bg-red-100 p-3 text-sm text-red-700 rounded"
        v-if="error.key || !geoClient"
    >
        <span>Be sure to add the following environment variables to your .env</span>
        <ul class="mt-1 list-disc ml-4">
            <li v-if="error.key">
                <code>MAPBOX_API_KEY</code>
            </li>
        </ul>
    </div>
    <div v-else>
        <v-select
            :modelValue="value"
            :filterable="false"
            :options="options"
            :placeholder="config.placeholder"
            label="place_name"
            @search="onSearch"
            @update:modelValue="setSelected"
        >
            <template #no-options>
                <div class="py-2 text-gray-600">
                    <p>Start typing address...</p>
                </div>
            </template>
            <template #option="option">
                <div class="d-center">
                    {{ option.place_name }}
                </div>
            </template>
            <template #selected-option="option">
                <div class="selected d-center">
                    {{ option.place_name }}
                </div>
            </template>
        </v-select>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import vSelect from 'vue-select';
import debounce from 'lodash.debounce';
import mbxClient from '@mapbox/mapbox-sdk';
import geoService from '@mapbox/mapbox-sdk/services/geocoding';

const props = defineProps({
    value: { default: null },
    meta: { type: Object, default: () => ({}) },
    config: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['update:value', 'meta-updated']);

const options = ref([]);

const geoClient = computed(() => {
    if (!props.meta.mapboxApiKey) {
        return null;
    }

    return geoService(mbxClient({ accessToken: props.meta.mapboxApiKey }));
});

const error = computed(() => ({
    key: !props.meta.mapboxApiKey,
}));

function setSelected(val) {
    emit('update:value', val);
}

const search = debounce(function (loading, query) {
    if (!geoClient.value) {
        return;
    }

    geoClient.value
        .forwardGeocode({
            query,
            limit: 10,
            autocomplete: true,
            language: props.config.language,
            countries: props.config.countries,
            types: props.config.featureTypes,
        })
        .send()
        .then((response) => {
            options.value = response.body.features;
        })
        .finally(() => {
            loading(false);
        });
}, 350);

function onSearch(searchTerm, loading) {
    if (searchTerm.length) {
        loading(true);
        search(loading, searchTerm);
    }
}
</script>

<style>
@import "vue-select/dist/vue-select.css";
</style>

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
            :modelValue="modelValue"
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

<script>
import { defineComponent } from 'vue';
import vSelect from 'vue-select';
import debounce from 'lodash.debounce';
import mbxClient from '@mapbox/mapbox-sdk';
import geoService from '@mapbox/mapbox-sdk/services/geocoding';

export default defineComponent({
    mixins: [Statamic.FieldtypeMixin],

    components: {
        vSelect,
    },

    data() {
        return {
            options: [],
        };
    },

    computed: {
        geoClient() {
            if (!this.meta.mapboxApiKey) return null;
            return geoService(mbxClient({ accessToken: this.meta.mapboxApiKey }));
        },
        error() {
            return {
                key: !this.meta.mapboxApiKey,
            };
        },
    },

    methods: {
        setSelected(value) {
            this.update(value);
        },
        onSearch(search, loading) {
            if (search.length) {
                loading(true);
                this.search(loading, search);
            }
        },
        search: debounce(function(loading, search) {
            if (!this.geoClient) return;
            this.geoClient
                .forwardGeocode({
                    query: search,
                    limit: 10,
                    autocomplete: true,
                    language: this.config.language,
                    countries: this.config.countries,
                    types: this.config.featureTypes,
                })
                .send()
                .then((response) => {
                    const match = response.body;
                    this.options = match.features;
                })
                .finally(() => {
                    loading(false);
                });
        }, 350),
    },
});
</script>

<style>
@import "vue-select/dist/vue-select.css";
</style>

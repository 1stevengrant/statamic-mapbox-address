import AddressField from "./components/address-field.vue";

Statamic.booting(() => {
    Statamic.component("address-fieldtype", AddressField);
});

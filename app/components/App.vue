<template>
    <Page>
        <ActionBar>
            <GridLayout width="100%" columns="auto, *">
                <Label class="fa menu-button" :text="'fa-bars' | fonticon" @tap="$refs.drawer.nativeView.showDrawer()" col="0"/>
                <SearchBar 
                    ref="searchBar"
                    class="search-bar" 
                    textFieldBackgroundColor="#ffffff"
                    color="875D2F"
                    hint="Search" 
                    v-model="search_text" 
                    @textChange="onSearchChanged" 
                    @submit="onSearch" 
                    col="1" />
            </GridLayout>
        </ActionBar>

        <RadSideDrawer ref="drawer">
            <StackLayout class="drawer-content" ~drawerContent backgroundColor="#1F1130">
                <Image class="drawer-header" src="~/assets/images/logo_text.png" stretch="none"/>

                <Label class="drawer-item"
                    v-for="category in categories" 
                    v-bind:class="{'active' : (category.id === category_id)}"
                    :key="category.id"  
                    :text="category.name"
                    @tap="change_category(category.id)"/>
            </StackLayout>

            <StackLayout ~mainContent backgroundColor="#1F1130">
                <ActivityIndicator v-if="loading" class="loader" color="#875D2F" :busy="loading"/>
                <RadListView 
                    v-show="!loading"
                    ref="listView" 
                    for="product in current_list" 
                    layout="grid"
                    pullToRefresh="true"
                    @pullToRefreshInitiated="pull_refresh()"
                    aspectFill="2"
                    loadOnDemandMode="Auto"
                    @loadMoreDataRequested="load_more()"
                    >
                    <v-template name="header">
                        <Label class="category-name" :text="head_name"/>
                    </v-template>
                    <v-template>
                        <StackLayout class="product-item" orientation="vertical" @tap="view_product(product.id)">
                            <WebImage 
                                class="product-image" 
                                height="150"
                                placeholder="~/assets/images/logo.png" 
                                placeholderStretch="aspectFit" 
                                :src="product.image"
                                stretch="aspectFill">
                            </WebImage>
                            <Label class="product-code" :text="product.code"></Label>
                            <Label class="product-description" :text="product.description"></Label>
                            <Label class="product-price" :text="product.price"></Label>
                        </StackLayout>
                    </v-template>
                    <v-template name="footer">
                        <Label class="empty-list" text="No Products Available"/>
                    </v-template>
                </RadListView>
            </StackLayout>
        </RadSideDrawer>
    </Page>
</template>

<script >
import Api from '@/api';
import ProductDetail from './ProductDetail';

export default {
    data() {
        return {
            category_id: 0,
            db_products: [],
            original_products: [],
            products: [],
            current_list: [],
            categories: [],
            search_text: '',
            loading: true
        }
    },
    created () {
        this.get_products();
    },
    computed: {
        head_name: function () {
            if (this.search_text === '') {
                let category = null
            
                this.categories.filter(function (c) {
                    if (c.id === this.category_id) {
                        category = c;
                    }

                    return true;
                }.bind(this));
                
                if (category) {
                    return category.name;
                }
            } else {
                return 'Search results for "' + this.search_text + '"';
            }
            

            return '';
        },
        list_empty: function () {
            if (this.current_list.length === 0) {
                return true;
            }

            return false;
        }
    },
    methods: {
        view_product (id) {

            let product = this.db_products.find(p => p.id === id);

            this.$navigateTo(ProductDetail, {
                clearHistory: false, 
                backstackVisible: true, 
                transition: { 
                    name: "slide",
                    duration: 380,
                    curve: "easeIn"
                },
                props: {
                    product: product,
                }
            });
        },
        pull_refresh () {
            if (this.search_text !== '') {
                this.search_filter();
            } else {
                this.change_category(this.category_id);
            }
        },
        load_more () {
            if (this.products.length > 0) {
                let next_items = this.products.splice(0,6);
                setTimeout(function () {
                    next_items.filter(function (item) {
                        this.current_list.push(item);
                    }.bind(this));
                    
                    this.$refs.listView.nativeView.notifyLoadOnDemandFinished();
                    this.$refs.listView.nativeView.notifyPullToRefreshFinished();
                    
                    this.loading = false;
                }.bind(this), 1000);
            } else {
                this.$refs.listView.nativeView.notifyLoadOnDemandFinished();
                this.$refs.listView.nativeView.notifyPullToRefreshFinished();
                this.loading = false;
            }
        },
        onSearchChanged () {
            this.search_filter();
        },
        onSearch () {
            this.search_filter();
        },
        search_filter (){
            this.products = [];
            this.current_list = [];
            
            if (this.search_text !== '') {
                let filtered_products = [];

                this.original_products.filter(function (product) {
                    if (product.code.toLowerCase().includes(this.search_text) ||
                        product.category_name.toLowerCase().includes(this.search_text)) {
                        filtered_products.push(product);
                    }

                    return true;
                }.bind(this));
                
                this.products = filtered_products;
                
                this.load_more();
            } else {
                this.change_category(this.category_id);
            }
        },
        change_category (category_id) {
            this.loading = true;
            this.$refs.drawer.nativeView.closeDrawer();
            this.current_list = [];
            this.category_id = category_id;
            
            let filtered_products = [];

            this.original_products.filter(function (product) {
                if (product.category_id === category_id) {
                    filtered_products.push(product);
                }

                return true;
            }.bind(this));
            
            this.products = filtered_products;
            this.load_more();
        },
        formatCurrency (str) {
            return str.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        },
        get_products () {
            Api().get('product').then(response => {
                response.data.products.filter(function (product) {

                    if (product.product_status.status.toLowerCase() === 'on hand') {

                        let image = '/static/img/logo.svg';
                        let price = '\u20B1 ' + this.formatCurrency(product.price.toString());

                        if (typeof product.product_images[0] !== 'undefined') {
                            let image_url = product.product_images[0].url;
                            image = image_url.replace('upload/', 'upload/f_auto,q_auto/');
                        }
                        
                        let data = {
                            id: product.id,
                            code: product.code,
                            description: product.description,
                            category_id: product.category_id,
                            category_name: product.category.name,
                            price: price,
                            image: image
                        };
                        
                        this.db_products.push(product);
                        this.original_products.push(data);
                    }

                    return true; 
                }.bind(this));

                this.get_categories();
            });
        },
        get_categories () {
            Api().get('category').then(response => {
                this.categories = response.data.categories;
                
                if (typeof this.categories[0] !== 'undefined') {
                    this.change_category(this.categories[0].id);
                }
                
            });
        }
    }
}
</script>

<style scoped>

    ActionBar {
        background-color: #1F1130;
        color: #ffffff;
    }

    .menu-button {
        color: #875D2F;
    }

    .search-bar {
        color: #875D2F;
        font-family: "Big Caslon", "BigCaslon"
    }

    .drawer-header {
        padding: 50 16 16 16;
        margin-bottom: 16;
        background-color: #1F1130;
    }

    .drawer-content {
        background-color: #1F1130;
    }

    .drawer-item {
        padding: 8 16;
        margin: 1 0;
        color: #875D2F;
        font-size: 18;
        font-family: "Big Caslon", "BigCaslon"
    }

    .drawer-item.active {
        background-color: #875D2F;
        color: #1F1130;
    }

    .category-name {
        padding: 8;
        text-align: center;
        font-size: 24;
        color: #875D2F;
        font-weight: bold;
        font-family: "Big Caslon", "BigCaslon"
    }

    .empty-list {
        padding: 8;
        margin: 10 0;
        text-align: center;
        vertical-align: middle;
        font-size: 30;
        color: rgb(163, 163, 163);
        font-family: "Big Caslon", "BigCaslon"
    }

    .product-item {
        margin: 8;
        font-family: "Big Caslon", "BigCaslon"
    }

    .product-code {
        margin: 3 0;
        padding: 3 0;
        font-size: 18;
        color: #875D2F;
    }

    .product-description {
        color: #875D2F;
        font-size: 12;
    }

    .product-price {
        color: #875D2F;
        margin: 2 0;
        padding: 2 0;
        font-size: 16;
    }
</style>

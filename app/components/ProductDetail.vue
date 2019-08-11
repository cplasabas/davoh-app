<template>
  <Page actionBarHidden="true">
    <StackLayout class="product-content" backgroundColor="#1F1130">
      <GridLayout width="100%" height="10%" class="product-head" columns="auto, *">
        <Label class="fa back-button" @tap="$navigateBack" col="0">{{'fa-angle-left' | fonticon}}</Label>
        <WebImage 
            class="davoh-logo" 
            height="40"
            placeholder="~/assets/images/logo_text.png" 
            placeholderStretch="aspectFit" 
            src="~/assets/images/logo_text.png"
            stretch="aspectFit"
            col="1">
        </WebImage>
      </GridLayout>
    
      <Carousel height="45%" width="100%"
        indicatorColor="#fff000" finite="true" bounce="false"
        showIndicator="true" verticalAlignment="top"
        android:indicatorAnimation="swap" color="white"
      >
          <CarouselItem v-for="image in images" :key="image" >
            <WebImage 
              class="product-image" 
              height="250"
              placeholder="~/assets/images/logo.png" 
              placeholderStretch="aspectFit" 
              :src="image"
              stretch="aspectFill">
            </WebImage>
          </CarouselItem>
      </Carousel>
      
      <ScrollView >
        <StackLayout class="product-details">
          <Label class="product-code" :text="product.code"/>
          <Label class="product-description" row="0" col="0" :text="product.description"/>

          <GridLayout class="details-container" columns="auto, auto, auto" rows="auto, auto, auto">
            <Label class="product-price" row="0" col="0" :text="price"/>
            <Label class="product-diamond-size" row="1" col="0" :text="'Diamond Size: ' + product.product_detail.diamond_size"/>
            <Label 
              class="product-diamond-weight" 
              row="1" col="1" 
              :text="'Diamond Weight: ' + product.product_detail.diamond_weight + 'ct'"/>
            <Label 
              class="product-gold-weight" 
              row="2" col="0" 
              :text="'Gold Weight: ' + product.product_detail.gold_weight + 'gm'"/>
            <Label 
              class="product-gold-touch" 
              row="2" col="1" 
              :text="'Gold Touch: ' + product.product_detail.gold_touch + 'K'"/>
          </GridLayout>
        
        </StackLayout>
      </ScrollView>
      
    </StackLayout>
  </Page>
</template>

<script >
import Api from '@/api';

export default {
    props: ['product'],
    data() {
        return {
          price: 0,
          images: [],  
        }
    },
    created () {
      if (typeof this.product.product_images[0] !== 'undefined') {
        this.product.product_images.filter(function (image) {
          let url = image.url;

          this.images.push(url.replace('upload/', 'upload/f_auto,q_auto/'));
        }.bind(this));
      } else {
        this.images.push('/static/img/logo.svg');
      }  

      this.price = '\u20B1 ' + this.formatCurrency(this.product.price.toString());
    },
    computed: {
    },
    methods: {
      formatCurrency (str) {
        return str.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      },
    }
}
</script>

<style scoped>

  .product-head {
    background-color: #1F1130;
  }

  .product-heading {
    padding: 8;
    text-align: center;
    vertical-align: middle;
    color: #875D2F;
    font-size: 24;
    font-weight: bold;
    font-family: "Big Caslon", "BigCaslon"
  }

  .back-button {
    color: #875D2F;
    margin: 10 10;
    padding: 10 10;
    font-size: 18;
  }

  .product-code {
    padding: 8;
    text-align: center;
    vertical-align: middle;
    color: #875D2F;
    font-size: 30;
    font-weight: bold;
    font-family: "Big Caslon", "BigCaslon"
  }

  .product-description {
    font-size: 14;
    text-align: center;
    vertical-align: middle;
    color: #875D2F;
    font-family: "Big Caslon", "BigCaslon"
  }

  .product-price {
    font-size: 25;
    padding: 8;
    color: #875D2F;
    font-family: "Big Caslon", "BigCaslon"
  }

  .details-container {
    margin: 8 0;
  }

  .product-diamond-party,
  .product-diamond-size,
  .product-diamond-weight,
  .product-gold-weight,
  .product-gold-touch {
    font-size: 16;
    padding: 8;
    color: #875D2F;
    font-family: "Big Caslon", "BigCaslon"
  }
</style>
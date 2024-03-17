<template>
  <div>
    <div class="main">
      <p>
        voluba uses 'cookies' (text files placed on your computer) to verify login details, remember user choices and preferences, and in some instances determine site permissions. Cookies also provide, in anonymous form, the number of visitors accessing the HBP Public Website, features users access during website visits, and the general location of the user based on IP address.
      </p>
      <p>
        voluba uses at least the following cookies:
      </p>
      <p>
        <strong>
          connect.sid
        </strong>:
        verify login details
      </p>
      <p>
        To find out more about cookies, including how to determine the cookies that have been set on your computer and how to manage or delete them, visit <a href="www.aboutcookies.org">www.aboutcookies.org</a> .
      </p>
      <p>
        To opt-out of being tracked by Google Analytics across all websites, visit <a href="http://tools.google.com/dlpage/gaoptout">http://tools.google.com/dlpage/gaoptout</a> .
      </p>
      <p>
        Human Brain Project has a dedicated Data Protection Officer, where you can direct your queries: <a href="mailto:data.protection@humanbrainproject.eu">data.protection@humanbrainproject.eu</a>
      </p>
    </div>

    <small
      @click="showMore = !showMore"
      class="btn btn-block btn-sm btn-outline-info">
      {{ showMoreText }}
    </small>

    <!-- showmore info -->
    <div v-if="showMore">
      <div class="showmore-item">
        <strong>Data controller(s)</strong>: voluba is the data controller for your login information.
      </div>
      <div class="showmore-item">
        <strong>List of partners responsible</strong>:
        FZJ-INM1 <a :href="'mailto:' + email ">{{ email }} </a>
      </div>
      <div class="showmore-item">
        <strong>HBP Data Protection Officer (HBP DPO)</strong>: You can find out about HBP Data Protection policies here:
          <a href="https://www.humanbrainproject.eu/en/social-ethical-reflective/ethics-support/data-protection/">https://www.humanbrainproject.eu/en/social-ethical-reflective/ethics-support/data-protection/</a>
          and you can contact HBP Data Protection Officer at <a href="mailto:data.protection@humanbrainproject.eu">data.protection@humanbrainproject.eu</a>
      </div>
      <div class="showmore-item">
        <strong>Legal basis for data processing</strong>:
        consent
      </div>
      <div class="showmore-item">
        <strong>General categories of personal data collected</strong>:
        Name, ORC ID, JWT ID Token
      </div>
      <div class="showmore-item">
        <strong>Data shared within the HBP Consortium</strong>:
        JWT ID Token is shared with ChunMa (Chunk Master), enabling upload and retrieval of user uploaded data.  
      </div>
      <div class="showmore-item">
        <strong>Data Shared with Third Parties</strong>: none
      </div>
      <div class="showmore-item">
        <strong>Transfer of any personal data to third countries</strong>: Data are stored in HBP infrastructure, and will not be transferred to Third countries.
      </div>
      <div class="showmore-item">
        <strong>Retention periods</strong>: 24 hours
      </div>
      <div class="showmore-item">
        <strong>Lodging a complaint</strong>:
        The HBP DPO and HBP partners will make every reasonable effort to address your data protection concerns. However, you have a right to lodge a complaint with a data protection authority. Contact information for the European Data Protection Board and EU DPAs are available here:
        <ul>
          <li>
            <a href="http://ec.europa.eu/newsroom/article29/item-detail.cfm?item_id=612080">http://ec.europa.eu/newsroom/article29/item-detail.cfm?item_id=612080</a>
          </li>
          <li>
            <a href="https://edpb.europa.eu/about-edpb/board/members_en">https://edpb.europa.eu/about-edpb/board/members_en</a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script>
import { EMAIL_CONTACT } from '@/constants'
export default {
  data: function () {
    return {
      showMore: false
    }
  },
  computed: {
    showMoreText: function () {
      return this.showMore ? 'show less' : 'show more'
    },
    email: function () {
      return EMAIL_CONTACT
    }
  }
}
</script>
<style scoped>
.showmore-item
{
  font-size: 80%;
}
</style>

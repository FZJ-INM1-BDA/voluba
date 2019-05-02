<template>
  <div>
    <div class="main">
      Our site saves small pieces of text information (cookies) on your device in order to deliver better content and for statistical purposes. You can disable the usage of cookies by changing the settings of your browser. By browsing our website without changing the browser settings you grant us permission to store that information on your device.
    </div>

    <small
      @click="showMore = !showMore"
      class="btn btn-block btn-sm btn-outline-info">
      {{ showMoreText }}
    </small>

    <!-- showmore info -->
    <div v-if="showMore">
      <div class="showmore-item">
        <strong>Data controller(s)</strong>: VoluBA is the data controller for your login information.
      </div>
      <div class="showmore-item">
        <strong>List of partners responsible</strong>:
        FZJ-INM1 <a href="mailto:inm1-bda@fz-juelich.de">inm1-bda@fz-juelich.de</a>
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
export default {
  data: function () {
    return {
      showMore: false
    }
  },
  computed: {
    showMoreText: function () {
      return this.showMore ? 'show less' : 'show more'
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

<template>
  <div id="sidebar">
    <div id="accordion" role="tablist">
      <b-card no-body>
        <b-card-header header-tag="header" role="tab">
          <a v-b-toggle.collapse-datasets>
            <font-awesome-icon icon="angle-left" pull="right" class="when-closed"/>
            <font-awesome-icon icon="angle-down" pull="right" class="when-opened"/>
            <h6><strong>Datasets</strong></h6>
          </a>
        </b-card-header>
        <b-collapse id="collapse-datasets" visible="true">
          <b-card-body>
            <label>Select a reference volume:</label>
            <br>
            <select></select>
            <hr>
            <label>Select a template volume:</label>
            <br>
            <select></select>
            <br><br>
            <b-button href="#" variant="secondary">
              <font-awesome-icon icon="upload"/>
              Upload
            </b-button>
          </b-card-body>
        </b-collapse>
      </b-card>

      <b-card no-body>
        <b-card-header header-tag="header" role="tab">
          <a v-b-toggle.collapse-registration>
            <font-awesome-icon icon="angle-left" pull="right" class="when-closed"/>
            <font-awesome-icon icon="angle-down" pull="right" class="when-opened"/>
            <h6><strong>Registration</strong></h6>
          </a>
        </b-card-header>
        <b-collapse id="collapse-registration">
          <b-card-body></b-card-body>
        </b-collapse>
      </b-card>

      <b-card no-body>
        <b-card-header header-tag="header" role="tab">
          <a v-b-toggle.collapse-landmark-pairs>
            <font-awesome-icon icon="angle-left" pull="right" class="when-closed"/>
            <font-awesome-icon icon="angle-down" pull="right" class="when-opened"/>
            <h6><strong>Landmark pairs</strong></h6>
          </a>
        </b-card-header>
        <b-collapse id="collapse-landmark-pairs">
          <b-card-body></b-card-body>
        </b-collapse>
      </b-card>

      <b-card no-body>
        <b-card-header header-tag="header" role="tab">
          <a v-b-toggle.collapse-transformation>
            <font-awesome-icon icon="angle-left" pull="right" class="when-closed"/>
            <font-awesome-icon icon="angle-down" pull="right" class="when-opened"/>
            <h6><strong>Transformation</strong></h6>
          </a>
        </b-card-header>
        <b-collapse id="collapse-transformation">
          <b-card-body>
            <label>Select a transformation type:</label>
            <br>
            <select>
              <option value="rigid">Rigid</option>
              <option value="rigid+reflection">Rigid (allow reflection)</option>
              <option value="similarity">Similarity</option>
              <option value="similarity+reflection">Similarity (allow reflection)</option>
              <option value="affine">Affine</option>
            </select>
            <br><br>
            <b-button href="#" variant="secondary">
              <font-awesome-icon icon="play-circle"/>
              Compute transformation
            </b-button>
            <hr>
            <b-container-fluid>
              <b-row>
                <b-col md="5"><label>Determinant:</label></b-col>
                <b-col md="7"><label/></b-col>
              </b-row>
              <b-row class="my-1">
                <b-col md="5"><label>RMSE:</label></b-col>
                <b-col md="7"><label/></b-col>
              </b-row>
            </b-container-fluid>
            <b-button href="#" variant="secondary">
              <font-awesome-icon icon="eye"/>
              Show transformation matrix
            </b-button>
          </b-card-body>
        </b-collapse>
      </b-card>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SidebarComponent'
}
</script>

<style scoped>
#sidebar {
  background-color: lightgray;
}

.collapsed > .when-opened,
:not(.collapsed) > .when-closed {
  display: none;
}
</style>

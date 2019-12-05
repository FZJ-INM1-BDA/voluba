# Voluba User Documentation

volumetric brain anchoring

## Useful info

- report a bug: <inm1-bda@fz-juelich.de>
- production instance: <https://voluba.apps.hbp.eu>
- develop instance: <https://voluba-next.apps-dev.hbp.eu>

## Before starting

You will need an [ORCID](https://orcid.org/) or [HBP OIDC](https://wiki.humanbrainproject.eu) account if you would like to upload and anchor your own nifti volume.

## Getting started

- navigate to <https://voluba.apps.hbp.eu> or <https://voluba-next.apps-dev.hbp.eu>

  ![](images/home.png)

- Either:
  - Selected a public volume

    ![](images/public_volumes.png)

  - Upload and/or select a private volume
    - Login with ORCID or HBP OIDCv2
    - Either:
      - Select a private volume
        ![](images/select_private_volume.png)
      - Upload a private volume

- Click **Start** to start the volumetric anchoring workflow

## Coarse alignment (Optional)

- Click-Drag incoming volume to approximate location
  ![](images/drag_drop_voluba_f10.gif)



## Fine aligment

Fine alignment can be achieved by adding corresponding landmarks on incoming and reference landmarks. 

### Overlay mode

- Open **Edit landmarks** menu
  ![](images/edit_landmark_btn.png)

- Use **Add a landmark pair** button to add landmark in reference volume first, then incoming volume
  ![](images/add_landmark_pair_btn.png)

### Parallel mode

Parallel mode can be toggled via the **two panel mode** button on top right corner.

![](images/parallel_mode_btn.png)

![](images/parallel_mode.png)

Adding landmark in reference template

![](images/adding_lm_parallelmode_1.png)

Adding landmark in incoming volume

![](images/adding_lm_parallelmode_2.png)

## Calculate linear transformation

When three or more landmark pairs have been added **Compute and display transform based on landmarks** Computes the linear transformation of volume and applies it to the incoming volume

![](images/calculate_transformation_f10.gif)
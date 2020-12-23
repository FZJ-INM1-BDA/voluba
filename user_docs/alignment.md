# Aligning the input dataset to the reference volume 

## Adjusting the initial 3D position

You can `drag` incoming volume to the approximate location of the reference template.

[![screenshot](images/drag_drop_voluba_f10.gif)](images/drag_drop_voluba_f10.gif)

## Refining the alignment with pairs of corresponding 3D landmarks

!!! hint
    Toggle on to enable a most distraction free fine alignment workflow.

You can refine the linear alignment by adding corresponding landmarks on both the incoming volume and in the reference space.

- Open **Edit Landmarks** menu

[![screenshot](images/edit_landmark_btn.png)](images/edit_landmark_btn.png)

- Use **Add a landmark pair** button to add landmark in reference volume first, then incoming volume

[![screenshot](images/add_landmark_pair_btn.png)](images/add_landmark_pair_btn.png)
## Calculate linear transformation

When three or more landmark pairs have been added **Compute and display transform based on landmarks** Computes the linear transformation of volume and applies it to the incoming volume

[![screenshot](images/calculate_transformation_f10.gif)](images/calculate_transformation_f10.gif)

The linear transformation is calculated by <https://github.com/HumanBrainProject/voluba-linear-backend> deployed on ebrains infrastructure.


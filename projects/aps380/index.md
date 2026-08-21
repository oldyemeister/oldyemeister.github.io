---
layout: project_case_study
title: "Vision-Assisted Adaptive Cruise Control"
description: "Design and validation of a Raspberry Pi autonomous vehicle with adaptive cruise control, lane keeping, emergency braking, and vision-based stop-sign detection."
eyebrow: "Autonomous vehicle · Controls and perception"
summary: "A four-person APS380 project integrating distance sensing, lane tracking, motor control, and computer vision into a compact autonomous vehicle that met or exceeded every planned validation target."
hero_image: "/assets/images/projects/aps380/hero.jpg"
hero_alt: "Completed APS380 autonomous vehicle with its custom silver body"
hero_caption: "Completed autonomous vehicle with its custom body installed."
role: "Team member"
team_size: "4 students"
timeline: "One academic term"
collaborators:
  - name: "Yilong Chen"
    url: ""
  - name: "Kenny Guo"
    url: ""
  - name: "Rachel Zhu"
    url: ""
tools:
  - "Raspberry Pi 5"
  - "Python"
  - "PID Control"
  - "Computer Vision"
source_url: ""
permalink: /projects/aps380/
published: true
---

## Project overview

Our four-person team built a small autonomous vehicle that combines **adaptive cruise control**, **lane keeping**, **emergency braking**, and **vision-based stop-sign detection**. A Raspberry Pi 5 coordinates an ultrasonic distance sensor, a four-channel infrared line sensor, a Pi camera, four DC motors, and two motor drivers in a single integrated control system.

The vehicle maintains a steady cruise speed on a marked track, adjusts its speed to follow a lead vehicle at a safe distance, stops immediately for close obstacles, and performs a controlled three-second stop when its camera recognizes a stop sign.

| Performance metric | Result |
| --- | ---: |
| Control-loop rate | 10 Hz |
| Cruise speed | ≈0.4 m/s |
| Following-distance target | 30 cm |
| Steady-state following error | Within ≈5 cm |
| Sensor-to-command reaction time | ≈100 ms |
| Stop-sign detection range | 30–60 cm |
| Vision-processing latency | ≈150–200 ms/frame |

![Completed APS380 autonomous vehicle](/assets/images/projects/aps380/hero.jpg)

*Figure 1. Completed autonomous vehicle with its custom body installed.*
{: .image-caption}

![APS380 vehicle electronics and sensor platform](/assets/images/projects/aps380/figure-2.png)

*Figure 2. Exposed vehicle platform showing the Raspberry Pi, camera, ultrasonic sensor, control electronics, battery, and drivetrain.*
{: .image-caption}

## System architecture

A 12 V lithium-ion battery powers the four DC motors through two motor-driver boards. A 5 V regulator supplies the Raspberry Pi 5, which reads every sensor and issues motor commands. The implementation uses a single-threaded Python loop running at 10 Hz, prioritizing rapid integration and predictable state transitions over strict real-time guarantees.

![Hardware architecture diagram](/assets/images/projects/aps380/figure-3.png)

*Figure 3. Hardware connections between the Raspberry Pi, camera, ultrasonic and IR sensors, motor drivers, battery, and four-wheel drivetrain.*
{: .image-caption}

![Control and signal-flow diagram](/assets/images/projects/aps380/figure-4.png)

*Figure 4. Signal flow for lane keeping, adaptive cruise control, stop-sign handling, and motor actuation.*
{: .image-caption}

### Control priorities

The software coordinates several behaviors operating at different rates. Emergency braking has the highest priority and overrides every other command when the ultrasonic sensor reports an obstacle within 10 cm. Stop-sign handling then manages the required stationary period, while lane keeping and adaptive cruise control provide the normal steering and speed commands.

This finite-state approach was selected instead of a continuous model-predictive controller because the vehicle's operating scenarios were discrete and the project emphasized robust subsystem integration.

## Adaptive cruise control

The adaptive cruise controller uses ultrasonic distance measurements and a PID controller to maintain a 30 cm gap behind a lead vehicle. When no valid target is detected, the vehicle continues at a reduced cruise speed. If the gap changes, the controller adjusts the motor command to restore the setpoint.

Early tuning produced oscillation and visible overshoot. The team applied step changes in desired spacing, reduced the proportional gain, and introduced a small integral term. The revised controller maintained the target distance within approximately 5 cm—twice as precise as the original ±10 cm requirement.

## Lane keeping and emergency braking

Four infrared sensors detect reflective tape at the lane boundaries. The sensor pattern maps to steering behavior: the outer sensors command aggressive correction, the inner sensors make smaller adjustments, and the centered pattern drives straight.

Direct sunlight initially confused the IR array during outdoor testing. Threshold tuning and small physical shrouds around the sensors improved reliability under mixed lighting. The emergency-braking path was tested independently and consistently stopped the vehicle before collision when an obstacle entered the 10 cm safety zone.

![Front-mounted camera, ultrasonic sensor, and line sensor](/assets/images/projects/aps380/figure-7.jpg)

*Figure 7. Front-mounted Pi camera, HC-SR04 ultrasonic sensor, and four-channel IR line sensor on the vehicle platform.*
{: .image-caption}

## Validation and results

The completed platform passed all six planned validation categories. It remained within its lane for runs longer than 30 seconds, followed lead vehicles moving from 0.1 to 0.5 m/s, reacted to speed changes in approximately 100 ms against a 500 ms requirement, and operated in both indoor and outdoor test conditions.

![Vehicle completing the taped-track validation course](/assets/images/projects/aps380/figure-5.png)

*Figure 5. Track testing used reflective tape for lane boundaries and a lead vehicle to exercise following-distance control.*
{: .image-caption}

## Vision-based stop-sign detection

Computer vision expanded the project beyond its original cruise-control scope. A pre-trained convolutional neural network processes Pi camera frames and identifies stop signs between approximately 30 and 60 cm away. A confident detection transitions the vehicle into a stopped state for three seconds before normal cruise operation resumes.

The vision pipeline takes approximately 150–200 ms per frame, while distance sensing and motor control run at 10 Hz. Coordinating these different timescales required explicit state management so slower perception updates did not interfere with the safety-critical control loop.

![Stop sign identified by the vehicle vision system](/assets/images/projects/aps380/figure-6.png)

*Figure 6. Stop-sign detection result from the Raspberry Pi camera and convolutional neural network.*
{: .image-caption}

## Next iteration

A future revision could add wheel encoders for closed-loop speed measurement, use camera-based lane detection on more complex roads, and evaluate model-predictive control for smoother acceleration. Additional perception models could extend the system to pedestrians and traffic lights, while separating the vision and motor loops would improve timing isolation.

The project demonstrated how sensing, perception, control, power electronics, and mechanical design must work together in an autonomous electric-vehicle system. Its strongest result was not any single subsystem, but the successful integration of all four behaviors into one repeatable platform.

---
layout: project_case_study
page_class: aps380
title: "Vision-Assisted Adaptive Cruise Control"
description: "Design and validation of a Raspberry Pi autonomous vehicle with adaptive cruise control, lane keeping, emergency braking, and vision-based stop-sign detection."
eyebrow: "Autonomous vehicle · Controls and perception"
summary: "A Raspberry Pi vehicle that follows a lead car, stays in its lane, brakes for obstacles, and recognizes stop signs."
hero_image: "/assets/images/projects/aps380/hero.jpg"
hero_alt: "Completed APS380 autonomous vehicle with its custom silver body"
hero_caption: "Completed autonomous vehicle with its custom body installed."
role: "Raspberry Pi software"
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

## The result

Our four-person team built a Raspberry Pi vehicle combining **adaptive cruise control, lane keeping, emergency braking, and stop-sign detection**. It passed all six planned validation categories.

| Performance metric | Result |
| --- | ---: |
| Control-loop rate | 10 Hz |
| Cruise speed | ≈0.4 m/s |
| Following-distance target | 30 cm |
| Steady-state following error | Within ≈5 cm |
| Sensor-to-command reaction time | ≈100 ms |
| Stop-sign detection range | 30–60 cm |
| Vision-processing latency | ≈150–200 ms/frame |

![APS380 vehicle electronics and sensor platform](/assets/images/projects/aps380/figure-2.webp)

*Raspberry Pi, sensors, power electronics, and drivetrain.*
{: .image-caption}

## How it works

A Raspberry Pi 5 reads an ultrasonic sensor, four-channel IR line sensor, and Pi camera, then commands four DC motors through two drivers. A 12 V battery powers the motors; a 5 V regulator supplies the Pi. The single-threaded Python control loop runs at 10 Hz.

![Hardware architecture diagram](/assets/images/projects/aps380/figure-3.webp)

*Power, sensing, and motor connections.*
{: .image-caption}

Emergency braking overrides all commands when an obstacle enters the **10 cm safety zone**. Stop-sign handling takes priority next, followed by normal lane keeping and cruise control.

![Control and signal-flow diagram](/assets/images/projects/aps380/figure-4.webp)

*Control priorities and signal flow.*
{: .image-caption}

## Tuning on the track

The ultrasonic PID controller maintains a **30 cm following gap**. Reducing proportional gain and adding a small integral term brought steady-state error within 5 cm, versus the original ±10 cm requirement.

IR sensor patterns set steering corrections. Sunlight initially confused the array; threshold tuning and physical shrouds improved outdoor reliability.

![Front-mounted camera, ultrasonic sensor, and line sensor](/assets/images/projects/aps380/figure-7.webp)

*Front-mounted camera, ultrasonic sensor, and IR array.*
{: .image-caption}

## My contribution

I wrote the Raspberry Pi software, focusing on IR-based lane steering and ultrasonic detection of vehicles and obstacles ahead.

## Validation

The vehicle stayed in its lane for **30+ seconds**, followed lead vehicles at **0.1–0.5 m/s**, and reacted in **approximately 100 ms** against a 500 ms requirement. Tests covered indoor and outdoor conditions and independent emergency-braking checks.

![Vehicle completing the taped-track validation course](/assets/images/projects/aps380/figure-5.webp)

*Track tests for lane keeping and following distance.*
{: .image-caption}

A pre-trained convolutional neural network detects stop signs at **30–60 cm**, triggering a three-second stop. Vision takes 150–200 ms per frame, requiring explicit state management alongside the faster motor-control updates.

![Stop sign identified by the vehicle vision system](/assets/images/projects/aps380/figure-6.webp)

*Stop-sign detection from the Pi camera.*
{: .image-caption}

## Next iteration

Separate the vision and motor loops for better timing isolation. Wheel encoders could close the speed-control loop, while camera-based lane detection and model-predictive control could support more complex routes and smoother acceleration.

# **Indehell – 3D Profile Website**  

This is the 3D profile website of [**Indehell**](https://www.instagram.com/indehellstudio/), featuring an **interactive 3D animation** built with **WebGL - Three.js (Vanilla)** and **Tailwind CSS**.

## **Exploration**  

- All **3D models and animations** are created in **Blender**, utilizing **Cloth Simulation & Armature** for animation.  
- The `.glb` files are optimized using **Draco & MeshOptimizer** for minimize the size.  
- Through experimentation, **cloth simulation data is best compressed using MeshOptimizer**, while **simple mesh types are better suited for Draco compression**.  
- Web-integrated animations are manually handled using **vanilla JavaScript**, employing techniques such as `setTimeout`, `transitionend` events, and other manual state management methods to control animation flow.  

#### **Decoding & Optimization**  
- **Draco Loader** dari [Three.js](https://threejs.org/docs/#examples/en/loaders/DRACOLoader)  
- **MeshOptimizer** dari [Zeux/Meshoptimizer](https://github.com/zeux/meshoptimizer)  

## **Tech Stack**  

- [Three.js](https://threejs.org/)
- [DracoLoader](https://threejs.org/docs/#examples/en/loaders/DRACOLoader) 
- [MeshOptimizer](https://github.com/zeux/meshoptimizer)
- [Tween.js](https://github.com/tweenjs/tween.js/) 
- [Tailwind CSS V4](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/) 


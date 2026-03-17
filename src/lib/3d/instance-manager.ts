/**
 * Instance Manager
 * Handles instanced mesh creation and updates for efficient rendering
 */

import * as THREE from 'three';
import { generateSlotTransform } from './sphere-math';

export interface InstanceData {
  index: number;
  position: THREE.Vector3;
  scale: number;
  color: THREE.Color;
  visible: boolean;
}

export interface InstanceGroup {
  mesh: THREE.InstancedMesh;
  count: number;
  startIndex: number;
  endIndex: number;
  needsUpdate: boolean;
}

export interface InstanceManagerConfig {
  maxInstancesPerMesh: number;
  baseGeometry: THREE.BufferGeometry;
  baseMaterial: THREE.Material;
  sphereRadius: number;
  totalSlots: number;
}

/**
 * Instance Manager
 * Manages multiple instanced meshes for rendering millions of slots
 */
export class InstanceManager {
  private groups: InstanceGroup[] = [];
  private config: InstanceManagerConfig;
  private tempMatrix: THREE.Matrix4;
  private tempColor: THREE.Color;
  private tempPosition: THREE.Vector3;
  private tempQuaternion: THREE.Quaternion;
  private tempScale: THREE.Vector3;
  private instanceData: Map<number, InstanceData> = new Map();
  
  constructor(config: InstanceManagerConfig) {
    this.config = config;
    this.tempMatrix = new THREE.Matrix4();
    this.tempColor = new THREE.Color();
    this.tempPosition = new THREE.Vector3();
    this.tempQuaternion = new THREE.Quaternion();
    this.tempScale = new THREE.Vector3();
  }
  
  /**
   * Initialize instance groups
   */
  initialize(): void {
    const totalInstances = this.config.totalSlots;
    const instancesPerMesh = this.config.maxInstancesPerMesh;
    const numMeshes = Math.ceil(totalInstances / instancesPerMesh);
    
    for (let i = 0; i < numMeshes; i++) {
      const startIndex = i * instancesPerMesh;
      const endIndex = Math.min((i + 1) * instancesPerMesh, totalInstances);
      const count = endIndex - startIndex;
      
      const mesh = new THREE.InstancedMesh(
        this.config.baseGeometry,
        this.config.baseMaterial as THREE.Material,
        count
      );
      
      mesh.frustumCulled = true;
      mesh.name = `slot-instances-${i}`;
      
      // Initialize all instances
      this.initializeInstancePositions(mesh, startIndex, count);
      
      this.groups.push({
        mesh,
        count,
        startIndex,
        endIndex,
        needsUpdate: false
      });
    }
  }
  
  /**
   * Initialize positions for a group of instances
   */
  private initializeInstancePositions(
    mesh: THREE.InstancedMesh,
    startIndex: number,
    count: number
  ): void {
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const radius = this.config.sphereRadius;
    
    for (let i = 0; i < count; i++) {
      const slotIndex = startIndex + i;
      const phi = Math.acos(1 - 2 * (slotIndex + 0.5) / this.config.totalSlots);
      const theta = (slotIndex * goldenAngle) % (2 * Math.PI);
      
      const sinPhi = Math.sin(phi);
      const position = new THREE.Vector3(
        radius * sinPhi * Math.cos(theta),
        radius * sinPhi * Math.sin(theta),
        radius * Math.cos(phi)
      );
      
      // Generate transform matrix
      const matrix = generateSlotTransform(position, 0.3);
      
      mesh.setMatrixAt(i, matrix);
      
      // Set default color
      this.tempColor.setHSL(0.6, 0.5, 0.5);
      mesh.setColorAt(i, this.tempColor);
    }
    
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
  }
  
  /**
   * Update a single instance
   */
  updateInstance(
    slotIndex: number,
    updates: {
      position?: THREE.Vector3;
      scale?: number;
      color?: THREE.Color;
      visible?: boolean;
    }
  ): void {
    const groupIndex = this.findGroupIndex(slotIndex);
    if (groupIndex === -1) return;
    
    const group = this.groups[groupIndex];
    const localIndex = slotIndex - group.startIndex;
    
    // Get current matrix
    group.mesh.getMatrixAt(localIndex, this.tempMatrix);
    this.tempMatrix.decompose(this.tempPosition, this.tempQuaternion, this.tempScale);
    
    // Apply updates
    if (updates.position) {
      this.tempPosition.copy(updates.position);
    }
    if (updates.scale !== undefined) {
      this.tempScale.setScalar(updates.scale);
    }
    
    // Reconstruct matrix
    this.tempMatrix.compose(this.tempPosition, this.tempQuaternion, this.tempScale);
    group.mesh.setMatrixAt(localIndex, this.tempMatrix);
    
    // Update color
    if (updates.color && group.mesh.instanceColor) {
      group.mesh.setColorAt(localIndex, updates.color);
      group.mesh.instanceColor.needsUpdate = true;
    }
    
    group.needsUpdate = true;
  }
  
  /**
   * Batch update instances
   */
  batchUpdateInstances(updates: Array<{
    slotIndex: number;
    position?: THREE.Vector3;
    scale?: number;
    color?: THREE.Color;
  }>): void {
    const updatesByGroup = new Map<number, typeof updates>();
    
    // Group updates by mesh
    for (const update of updates) {
      const groupIndex = this.findGroupIndex(update.slotIndex);
      if (groupIndex === -1) continue;
      
      const groupUpdates = updatesByGroup.get(groupIndex) || [];
      groupUpdates.push(update);
      updatesByGroup.set(groupIndex, groupUpdates);
    }
    
    // Apply updates per group
    for (const [groupIndex, groupUpdates] of updatesByGroup) {
      const group = this.groups[groupIndex];
      
      for (const update of groupUpdates) {
        const localIndex = update.slotIndex - group.startIndex;
        
        if (update.position || update.scale !== undefined) {
          group.mesh.getMatrixAt(localIndex, this.tempMatrix);
          this.tempMatrix.decompose(this.tempPosition, this.tempQuaternion, this.tempScale);
          
          if (update.position) this.tempPosition.copy(update.position);
          if (update.scale !== undefined) this.tempScale.setScalar(update.scale);
          
          this.tempMatrix.compose(this.tempPosition, this.tempQuaternion, this.tempScale);
          group.mesh.setMatrixAt(localIndex, this.tempMatrix);
        }
        
        if (update.color && group.mesh.instanceColor) {
          group.mesh.setColorAt(localIndex, update.color);
        }
      }
      
      group.mesh.instanceMatrix.needsUpdate = true;
      if (group.mesh.instanceColor) {
        group.mesh.instanceColor.needsUpdate = true;
      }
    }
  }
  
  /**
   * Set visibility for a range of instances
   */
  setInstanceVisibility(
    startIndex: number,
    endIndex: number,
    visible: boolean
  ): void {
    const startGroup = this.findGroupIndex(startIndex);
    const endGroup = this.findGroupIndex(endIndex);
    
    if (startGroup === -1 || endGroup === -1) return;
    
    for (let g = startGroup; g <= endGroup; g++) {
      const group = this.groups[g];
      const localStart = g === startGroup ? startIndex - group.startIndex : 0;
      const localEnd = g === endGroup ? endIndex - group.startIndex : group.count;
      
      for (let i = localStart; i < localEnd; i++) {
        group.mesh.getMatrixAt(i, this.tempMatrix);
        this.tempMatrix.decompose(this.tempPosition, this.tempQuaternion, this.tempScale);
        
        const scale = visible ? this.tempScale.x || 0.3 : 0;
        this.tempScale.setScalar(scale);
        this.tempMatrix.compose(this.tempPosition, this.tempQuaternion, this.tempScale);
        group.mesh.setMatrixAt(i, this.tempMatrix);
      }
      
      group.mesh.instanceMatrix.needsUpdate = true;
    }
  }
  
  /**
   * Set colors based on status
   */
  setInstanceColors(
    colorData: Array<{ slotIndex: number; color: THREE.Color }>
  ): void {
    for (const { slotIndex, color } of colorData) {
      const groupIndex = this.findGroupIndex(slotIndex);
      if (groupIndex === -1) continue;
      
      const group = this.groups[groupIndex];
      const localIndex = slotIndex - group.startIndex;
      
      if (group.mesh.instanceColor) {
        group.mesh.setColorAt(localIndex, color);
        group.needsUpdate = true;
      }
    }
    
    // Update all modified groups
    for (const group of this.groups) {
      if (group.needsUpdate && group.mesh.instanceColor) {
        group.mesh.instanceColor.needsUpdate = true;
        group.needsUpdate = false;
      }
    }
  }
  
  /**
   * Get all meshes for scene addition
   */
  getMeshes(): THREE.InstancedMesh[] {
    return this.groups.map(g => g.mesh);
  }
  
  /**
   * Dispose all resources
   */
  dispose(): void {
    for (const group of this.groups) {
      group.mesh.geometry.dispose();
      if (Array.isArray(group.mesh.material)) {
        group.mesh.material.forEach(m => m.dispose());
      } else {
        group.mesh.material.dispose();
      }
    }
    this.groups = [];
    this.instanceData.clear();
  }
  
  /**
   * Find which group contains a slot
   */
  private findGroupIndex(slotIndex: number): number {
    for (let i = 0; i < this.groups.length; i++) {
      const group = this.groups[i];
      if (slotIndex >= group.startIndex && slotIndex < group.endIndex) {
        return i;
      }
    }
    return -1;
  }
  
  /**
   * Get statistics
   */
  getStats(): {
    totalGroups: number;
    totalInstances: number;
    memoryEstimateMB: number;
  } {
    const totalInstances = this.groups.reduce((sum, g) => sum + g.count, 0);
    
    // Estimate memory: matrix (64 bytes) + color (12 bytes) per instance
    const memoryEstimate = (totalInstances * 76) / (1024 * 1024);
    
    return {
      totalGroups: this.groups.length,
      totalInstances,
      memoryEstimateMB: Math.round(memoryEstimate * 100) / 100
    };
  }
}

/**
 * Create default geometry for slots
 */
export function createSlotGeometry(size: number = 0.3): THREE.BufferGeometry {
  // Use a simple box for performance, can be replaced with more complex geometry
  const geometry = new THREE.BoxGeometry(size, size, size);
  return geometry;
}

/**
 * Create default material for slots
 */
export function createSlotMaterial(): THREE.Material {
  return new THREE.MeshStandardMaterial({
    color: 0x4488ff,
    metalness: 0.3,
    roughness: 0.7,
    transparent: true,
    opacity: 0.9
  });
}

/**
 * Create cluster geometry for LOD
 */
export function createClusterGeometry(size: number = 1): THREE.BufferGeometry {
  return new THREE.OctahedronGeometry(size, 0);
}

/**
 * Create cluster material
 */
export function createClusterMaterial(): THREE.Material {
  return new THREE.MeshStandardMaterial({
    color: 0x88aaff,
    metalness: 0.5,
    roughness: 0.5,
    transparent: true,
    opacity: 0.7
  });
}

/**
 * Create a point-based representation for distant views
 */
export function createPointsGeometry(
  positions: Float32Array,
  colors: Float32Array
): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return geometry;
}

/**
 * Create points material
 */
export function createPointsMaterial(size: number = 2): THREE.PointsMaterial {
  return new THREE.PointsMaterial({
    size,
    vertexColors: true,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.8
  });
}

/**
 * Create the instance manager with default configuration
 */
export function createDefaultInstanceManager(
  sphereRadius: number = 100,
  totalSlots: number = 1_000_000
): InstanceManager {
  const geometry = createSlotGeometry(0.3);
  const material = createSlotMaterial();
  
  return new InstanceManager({
    maxInstancesPerMesh: 100000, // 100k instances per mesh
    baseGeometry: geometry,
    baseMaterial: material,
    sphereRadius,
    totalSlots
  });
}

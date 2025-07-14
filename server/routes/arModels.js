import express from 'express';
const router = express.Router();

// Sample AR model data - In production, this would come from a database
const arModels = {
  apparel: {
    default: 'https://modelviewer.dev/shared-assets/models/Headphones.glb',
    categories: {
      shirts: 'https://modelviewer.dev/shared-assets/models/Headphones.glb',
      pants: 'https://modelviewer.dev/shared-assets/models/Headphones.glb',
      dresses: 'https://modelviewer.dev/shared-assets/models/Headphones.glb',
      shoes: 'https://modelviewer.dev/shared-assets/models/Headphones.glb'
    }
  },
  furniture: {
    default: 'https://modelviewer.dev/shared-assets/models/Headphones.glb',
    categories: {
      chairs: '/AR-Code-1683007596576.glb',
      tables: 'https://modelviewer.dev/shared-assets/models/Headphones.glb',
      sofas: '/AR-Code-1683007596576.glb'
    }
  },
  electronics: {
    default: 'https://modelviewer.dev/shared-assets/models/Headphones.glb',
    categories: {
      phones: 'https://modelviewer.dev/shared-assets/models/Headphones.glb',
      laptops: 'https://modelviewer.dev/shared-assets/models/Headphones.glb'
    }
  }
};

// Get AR model URL for a product
router.get('/:type/:productId', async (req, res) => {
  const { type, productId } = req.params;
  
  console.log(`AR Model Request - Type: ${type}, ProductId: ${productId}`);
  
  if (!type || !productId) {
    return res.status(400).json({
      success: false,
      error: 'Type and productId are required'
    });
  }

  try {
    // Validate the type parameter
    if (!arModels[type]) {
      console.log(`Available types: ${Object.keys(arModels).join(', ')}`);
      return res.status(404).json({
        success: false,
        error: `AR model type '${type}' not found. Available types: ${Object.keys(arModels).join(', ')}`
      });
    }

    // Return the default model for the type
    const modelUrl = arModels[type].default;
    console.log(`Returning model URL: ${modelUrl}`);
    
    res.json({
      success: true,
      modelUrl: modelUrl
    });
  } catch (error) {
    console.error('Error fetching AR model:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch AR model'
    });
  }
});

// Get available AR model types
router.get('/types', (req, res) => {
  try {
    res.json({
      success: true,
      types: Object.keys(arModels)
    });
  } catch (error) {
    console.error('Error fetching AR model types:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch AR model types'
    });
  }
});

export default router;
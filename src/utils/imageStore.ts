import { supabase } from '../config/supabase';

export interface StoredImageData {
  imageData: ImageData;
  imageSrc: string;
  timestamp: number;
}

export const storeImageData = async (id: string, imageData: ImageData, imageSrc: string): Promise<void> => {
  console.log('Storing image data for ID:', id, 'Size:', imageData.data.length, 'bytes');
  try {
    const { error } = await supabase
      .from('images')
      .insert({
        id,
        pixel_data: Array.from(imageData.data),
        width: imageData.width,
        height: imageData.height,
        original_url: imageSrc
      });

    if (error) {
      console.error('Supabase storage failed:', error);
      // console.log('Falling back to localStorage for image ID:', id);
      // Fallback to localStorage
      const fallbackData = {
        imageData: {
          width: imageData.width,
          height: imageData.height,
          data: Array.from(imageData.data)
        },
        imageSrc,
        timestamp: Date.now()
      };
      localStorage.setItem(`image-${id}`, JSON.stringify(fallbackData));
    }
  } catch (error) {
    console.error('Storage error:', error);
    // Fallback to localStorage
    const fallbackData = {
      imageData: {
        width: imageData.width,
        height: imageData.height,
        data: Array.from(imageData.data)
      },
      imageSrc,
      timestamp: Date.now()
    };
    localStorage.setItem(`image-${id}`, JSON.stringify(fallbackData));
  }
};

export const getImageData = async (id: string): Promise<StoredImageData | null> => {
  console.log('Attempting to load image data for ID:', id);
  try {
    // Try Supabase first
    console.log('Checking Supabase for image ID:', id);
    const { data, error } = await supabase
      .from('images')
      .select('*')
      .eq('id', id)
      .single();

    if (!error && data) {
      console.log('Found image in Supabase for ID:', id);
      const imageData = new ImageData(
        new Uint8ClampedArray(data.pixel_data),
        data.width,
        data.height
      );

      return {
        imageData,
        imageSrc: data.original_url,
        timestamp: new Date(data.created_at).getTime()
      };
    } else {
      console.error('Supabase lookup failed for ID:', id, 'Error:', error);
    }

    // Fallback to localStorage
    console.log('Checking localStorage for image ID:', id);
    const stored = localStorage.getItem(`image-${id}`);
    if (stored) {
      console.log('Found image in localStorage for ID:', id);
      const parsed = JSON.parse(stored);
      const imageData = new ImageData(
        new Uint8ClampedArray(parsed.imageData.data),
        parsed.imageData.width,
        parsed.imageData.height
      );

      return {
        imageData,
        imageSrc: parsed.imageSrc,
        timestamp: parsed.timestamp
      };
    } else {
      console.log('No image found in localStorage for ID:', id);
    }

    console.log('No image found anywhere for ID:', id);
    return null;
  } catch (error) {
    console.error('Retrieval error:', error);
    return null;
  }
};

export const getAllStoredImages = async (): Promise<Array<{ id: string; imageSrc: string; timestamp: number }>> => {
  try {
    const { data, error } = await supabase
      .from('images')
      .select('id, original_url, created_at')
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      return data.map(item => ({
        id: item.id,
        imageSrc: item.original_url,
        timestamp: new Date(item.created_at).getTime()
      }));
    }
  } catch (error) {
    console.error('Failed to fetch images:', error);
  }

  return [];
};
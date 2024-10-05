import { productListController } from './productController'; // adjust the import as necessary
import productModel from '../models/productModel.js'; // adjust the import as necessary

jest.mock('../models/productModel.js'); // mock the product model

describe('Product List Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  it('should return product list for valid page parameter', async () => {
    // Arrange
    const products = [{ name: 'Product 1' }, { name: 'Product 2' }];
    productModel.find = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(products)
          }),
        }),
      }),
    });
    
    req.params.page = '1';

    // Act
    await productListController(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      products,
    });
  });

  it('BUG: should throw error if given an invalid page parameter', async () => {
    // Arrange
    req.params.page = 'invalid'; // Non-numeric string
    
    // Act
    await productListController(req, res);
  
    // Assert
    //expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: 'error in per page ctrl',
      error,
    });
  });

  test('should return empty products when no products are available', async () => {
    // Arrange
    productModel.find = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue([]), // Mock resolved empty array
          }),
        }),
      }),
    });
    
    req.params.page = '1'; // Requesting first page

    // Act
    await productListController(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      products: []
    });
  });

  test('should throw error if there is a database error', async () => {
    // Arrange
    const error = new Error('Database Error');
    productModel.find = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            sort: jest.fn().mockRejectedValue(error), // Simulate a database error
          }),
        }),
      }),
    });

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});    
    req.params.page = '1'; // Valid page

    // Act
    await productListController(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(consoleSpy).toHaveBeenCalledWith(error);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: 'error in per page ctrl',
      error,
    });
  });
});
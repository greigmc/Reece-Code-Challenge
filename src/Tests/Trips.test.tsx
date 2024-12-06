import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Trips from '../Components/Api/Trips';

describe('Trips Component', () => {
  beforeAll(() => {
    global.fetch = jest.fn(() =>
      new Promise((resolve) =>
        setTimeout(() => {
          resolve({
            ok: true,
            status: 200,
            statusText: 'OK',
            json: () =>
              Promise.resolve({
                tripSet: [
                  {
                    heroImage: 'example.jpg',
                    unitName: 'Trip 1',
                    unitStyleName: 'Style A',
                    checkInDate: '2022-12-01T00:00:00.000Z',
                  },
                  {
                    heroImage: 'example2.jpg',
                    unitName: 'Trip 2',
                    unitStyleName: 'Style B',
                    checkInDate: '2022-12-02T00:00:00.000Z',
                  },
                ],
              }),
          });
        }, 100)
      )
    ) as jest.Mock;
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  test('renders loading state initially', async () => {
    await act(async () => {
      render(<Trips />);
    });
    const loadingElement = screen.getByText(/Loading.../i);
    expect(loadingElement).toBeInTheDocument();
  });

  test('renders trips correctly after fetch', async () => {
    await act(async () => {
      render(<Trips />);
    });
    await waitFor(() => {
      expect(screen.getByText('Trip 1')).toBeInTheDocument();
      expect(screen.getByText('Trip 2')).toBeInTheDocument();
    });
  });

  test('renders error message when fetch fails', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('Failed to load data')));
    await act(async () => {
      render(<Trips />);
    });
    await waitFor(() => {
      expect(screen.getByText('Failed to load data. Please try again later.')).toBeInTheDocument();
    });
  });
});

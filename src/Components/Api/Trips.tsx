import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Alert } from 'react-bootstrap';

interface Trip {
  heroImage: string;
  unitName: string;
  unitStyleName: string;
  checkInDate: string;
}

interface TripResponse {
  tripSet: Trip[];
}

const Trips: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'ascending' | 'descending'>('ascending');
  const [unitStyles, setUnitStyles] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<string>('All');
  

  useEffect(() => {
    fetch('/trips.json') // Json file located in the public folder
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json() as Promise<TripResponse>;
      })
      .then((data) => {
        const simplifiedData: Trip[] = data.tripSet.map((trip) => ({
          heroImage: trip.heroImage,
          unitName: trip.unitName,
          unitStyleName: trip.unitStyleName,
          checkInDate: trip.checkInDate,
        }));

        const styles = Array.from(new Set(simplifiedData.map(trip => trip.unitStyleName)));
        setUnitStyles(['All', ...styles]);

        simplifiedData.sort((a: Trip, b: Trip) => new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime());

        setTrips(simplifiedData);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again later.');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const sortedTrips = [...trips].sort((a, b) => {
      const dateA = new Date(a.checkInDate).getTime();
      const dateB = new Date(b.checkInDate).getTime();
      return sortOrder === 'ascending' ? dateA - dateB : dateB - dateA;
    });
    setTrips(sortedTrips);
  }, [sortOrder]);

  const filteredTrips = selectedStyle === 'All'
    ? trips
    : trips.filter(trip => trip.unitStyleName === selectedStyle);

  if (loading) {
    return (
      <Container>
        <Alert variant="info">Loading...</Alert>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container>
      <h1 className="mb-4">UI Engineering Code Challenge</h1>
      <h4 className='mb-4'>Using React, Typescript & Vite</h4>
      <Row className="text-start">
      <Col md={6} sm={12}>
          <Form.Group controlId="sortOrder" className="mb-3">
            <Form.Label>Sort by Check-In Date</Form.Label>
            <Form.Control
              as="select"
              value={sortOrder}
              onChange={(e) =>
                setSortOrder(e.target.value as "ascending" | "descending")
              }
            >
              <option value="ascending">Closest Date</option>
              <option value="descending">Furthest Date</option>
            </Form.Control>
          </Form.Group>
        </Col>
        <Col sm={12} md={6}>
          <Form.Group controlId="unitStyle" className="mb-3">
            <Form.Label>Filter by Unit Style</Form.Label>
            <Form.Control
              as="select"
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
            >
              {unitStyles.map((style) => (
                <option key={style} value={style}>
                  {style}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
      </Row>
      <Row>
        {filteredTrips.map((trip, index) => (
          <Col key={index} md={4} className="mb-4">
            <Card>
              <Card.Img
                variant="top"
                src={`https://cms.inspirato.com/ImageGen.ashx?image=${trip.heroImage}&width=300&height=200`}
                alt={trip.unitName}
              />
              <Card.Body>
                <Card.Title>{trip.unitName}</Card.Title>
                <Card.Text>
                  <strong>Style:</strong> {trip.unitStyleName}
                  <br />
                  <strong>Check-In Date:</strong> {new Date(trip.checkInDate).toLocaleDateString()}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Trips;

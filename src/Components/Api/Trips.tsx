import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Alert,
  Pagination,
} from "react-bootstrap"; // Import components from React-Bootstrap

// Define an interface for a Trip object
interface Trip {
  heroImage: string;
  unitName: string;
  unitStyleName: string;
  checkInDate: string;
}

// Define an interface for the response from the API
interface TripResponse {
  tripSet: Trip[];
}

const Trips: React.FC = () => {
  // State to hold the trips data
  const [trips, setTrips] = useState<Trip[]>([]);
  // State to indicate if data is being loaded
  const [loading, setLoading] = useState<boolean>(true);
  // State to hold any error message
  const [error, setError] = useState<string | null>(null);
  // State to hold the sort order for the trips
  const [sortOrder, setSortOrder] = useState<"ascending" | "descending">(
    "ascending"
  );
  // State to hold the list of unit styles available
  const [unitStyles, setUnitStyles] = useState<string[]>([]);
  // State to hold the currently selected unit style for filtering
  const [selectedStyle, setSelectedStyle] = useState<string>("All");
  // State to hold the hold the search query
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const tripsPerPage = 9;

  // Effect to fetch the trips data from a local JSON file
  useEffect(() => {
    fetch("/trips.json") // JSON file located in the public folder
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json() as Promise<TripResponse>;
      })
      .then((data) => {
        // Simplify the trips data
        const simplifiedData: Trip[] = data.tripSet.map((trip) => ({
          heroImage: trip.heroImage,
          unitName: trip.unitName,
          unitStyleName: trip.unitStyleName,
          checkInDate: trip.checkInDate,
        }));

        // Extract unique unit styles and set the state
        const styles = Array.from(
          new Set(simplifiedData.map((trip) => trip.unitStyleName))
        );
        setUnitStyles(["All", ...styles]);

        // Sort the trips by check-in date
        simplifiedData.sort(
          (a: Trip, b: Trip) =>
            new Date(a.checkInDate).getTime() -
            new Date(b.checkInDate).getTime()
        );

        // Update the trips state and set loading to false
        setTrips(simplifiedData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setError("Failed to load data. Please try again later.");
        setLoading(false);
      });
  }, []);

  // Effect to re-sort the trips whenever the sort order changes
  useEffect(() => {
    const sortedTrips = [...trips].sort((a, b) => {
      const dateA = new Date(a.checkInDate).getTime();
      const dateB = new Date(b.checkInDate).getTime();
      return sortOrder === "ascending" ? dateA - dateB : dateB - dateA;
    });
    setTrips(sortedTrips);
  }, [sortOrder]);

  // Filter the trips based on the selected unit style and search query
  const filteredTrips = trips.filter((trip) => {
    const matchesStyle =
      selectedStyle === "All" || trip.unitStyleName === selectedStyle;
    const matchesSearch = trip.unitName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesStyle && matchesSearch;
  });

  // Paginate the filtered trips
  const indexOfLastTrip = currentPage * tripsPerPage;
  const indexOfFirstTrip = indexOfLastTrip - tripsPerPage;
  const currentTrips = filteredTrips.slice(indexOfFirstTrip, indexOfLastTrip);

  const totalPages = Math.ceil(filteredTrips.length / tripsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber: number) => setCurrentPage(pageNumber);

  // Display a loading message if data is still loading
  if (loading) {
    return (
      <Container>
        <Alert variant="info">Loading...</Alert>
      </Container>
    );
  }

  // Display an error message if there was an error fetching the data
  if (error) {
    return (
      <Container>
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  // Render the trips and control elements
  return (
    <Container style={{ minWidth: "1140px" }}>
      <h1 className="mb-4">UI Engineering Code Challenge</h1>
      <h4 className="mb-4">Using React, Typescript & Vite</h4>
      <Row className="text-start">
        <Col md={4} sm={12}>
          <Form.Group controlId="searchQuery" className="mb-3">
            <Form.Label>Search by Unit Name</Form.Label>
            <Form.Control
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search unit name..."
            />
          </Form.Group>
        </Col>
        <Col md={4} sm={12}>
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
        <Col sm={12} md={4}>
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
        {currentTrips.map((trip, index) => (
          <Col key={index} md={4} className="mb-4">
            <Card className="h-100">
              <Card.Img
                variant="top"
                src={`https://cms.inspirato.com/ImageGen.ashx?image=${trip.heroImage}&width=300&height=200`}
                alt={trip.unitName}
              />
              <Card.Body className="d-flex flex-column">
                <Card.Title className="flex-grow-1">{trip.unitName}</Card.Title>
                <Card.Text>
                  <strong>Style:</strong> {trip.unitStyleName}
                  <br />
                  <strong>Check-In Date:</strong>{" "}
                  {new Date(trip.checkInDate).toLocaleDateString()}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      <Row>
        <Col>
          <Pagination className="d-flex justify-content-center mt-4">
            <Pagination.First
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            />
            <Pagination.Prev
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            />
            {Array.from({ length: totalPages }, (_, index) => (
              <Pagination.Item
                key={index + 1}
                active={index + 1 === currentPage}
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            />
            <Pagination.Last
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            />
          </Pagination>
        </Col>
      </Row>
    </Container>
  );
};

export default Trips;

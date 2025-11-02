import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const ListeningPractice = () => {
    const navigate = useNavigate();

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={8}>
                    <Card className="text-center">
                        <Card.Header as="h2">Luyện nghe</Card.Header>
                        <Card.Body>
                            <Card.Title>Tính năng đang được phát triển</Card.Title>
                            <Card.Text>
                                Chức năng luyện nghe hiện đang trong quá trình xây dựng và sẽ sớm ra mắt. Cảm ơn bạn đã thông cảm!
                            </Card.Text>
                            <Button variant="primary" onClick={() => navigate('/home')}>
                                Quay về Trang chủ
                            </Button>
                        </Card.Body>
                        <Card.Footer className="text-muted">Coming Soon</Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ListeningPractice;

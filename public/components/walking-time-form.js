import React from 'react';
import { Col, Button, FormGroup, FormControl, InputGroup } from 'react-bootstrap';


export default class WalkingTimeForm extends React.Component{
  constructor(props) {
    super(props);
  }

  closest(e) {
    this.props.closest(e);
  }

  distance(e) {
    this.props.distance(e);
  }

  render() {
    return (
      <Col md={4}>
        <form>
          <FormGroup>
            <InputGroup>
              <InputGroup.Button>
                <Button onClick={this.closest.bind(this)} type='submit' bsStyle="primary">Walk Time</Button>
              </InputGroup.Button>
              <FormControl type='number' onChange={this.distance.bind(this)} value={this.props.threshold} />
            </InputGroup>
          </FormGroup>
        </form>
      </Col>
    )
  }
}

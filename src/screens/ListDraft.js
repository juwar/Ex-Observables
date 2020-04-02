import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import withObservables from '@nozbe/with-observables';

import config from '../config';
import endpoint from '../config/endpoint';
import scale from '../config/scale';
import {getDate, getTime} from '../utils/DateFormat';
import * as screenName from '../router/screenNames';
// import database from '../model/database';
import { Q } from "@nozbe/watermelondb";

class ListRequest extends Component {
  constructor(props) {
    super(props);
    // this.handleChange = this.handleChange.bind(this);
    this.state = {
      listRequest: [],
      isFetching: false,
    };
    console.log('this.props', this.props)
  }


  fetchListRequest = async () => {
    try {
      const postsCollection = database.collections.get('requests');
      const allPosts = await postsCollection.query().fetch();
      this.setState({listRequest: allPosts, isFetching: false});
      return postsCollection;
    } catch (e) {
      console.log(e, 'juju');
    }
  };

  refresh = () => {
    this.setState({isFetching: true}, () => {
      this.fetchListRequest();
    });
  };

  componentDidMount() {
    this.refresh();
  }

  goToDetail = async detail => {
    console.log('detail >>>', detail)
    await this.props.database.action(async () => {
      try {
        /*
        console.log(detail)
        console.log(detail.id)
        const findHazard = await hazardsCollection.query(Q.where('id',detail.id));
        console.log('findHazard', findHazard)
        */

        await detail.update(request => {
          request.judulRequest = 'Updated Requst Title When go To Detail (Hard coded)';
        });

        // await detail.markAsDeleted() // syncable
        // await detail.destroyPermanently() // permanent

      }catch (e) {
        console.log(e)
      }
    });
  };


  _renderList = item => (
      <EnhancedRequstItem database={this.props.database} requests={item} onPress={this.goToDetail} />
    );
  

  db = () => {
    let database = null;
    try {
      database = this.props.database;
    } catch (e) {
      console.log(e);
    }
    return database;
  };

  render() {
    const {listRequest, isFetching} = this.state;

    return (
      <>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={config.color.background}
        />
        <View style={styles.mainContainer}>
          <FlatList
            data={this.props.listRequest}
            renderItem={({item}) => this._renderList(item)}
            keyExtractor={item => item.id}
            onRefresh={() => this.refresh()}
            refreshing={isFetching}
          />
        </View>
      </>
    );
  }
}

const enhanceMFL = withObservables(['database'], ({database}) => {
  // console.log('the data ==> ', database);
  console.log('database has changed')
  const query = database.collections.get('requests').query(Q.where('judulRequest', Q.notEq(null)));
  // const result = query.fetch().then(arr => console.log('ARRRR', arr));
  return {
    listRequest: query, // shortcut syntax for `comment: comment.observe()`
  };
});

const EnhancedComponent = enhanceMFL(ListRequest);

const RequestItem = ({requests, onPress}) => (
  <TouchableOpacity
    onPress={() => onPress(requests)}
    style={styles.listRequest}>
    <View style={styles.iconListRequest}>
      <Icon
        name={'hazard-lights'}
        size={scale(23)}
        color={config.color.common.darkRed}
      />
    </View>
    <View style={styles.descListRequest}>
      <Text>{requests.judulRequest}</Text>
      <Text>{requests.tipeRequest}</Text>
    </View>
    <View style={styles.timeListRequest}>
      <Text style={styles.time}>{getDate(requests.createdAt)}</Text>
      <Text style={styles.time}>{getTime(requests.createdAt)}</Text>
    </View>
  </TouchableOpacity>
);

const enhancef = withObservables(['requests', 'database'], ({requests, database}) => {
  console.log('db ==> ', database)
  console.log('req ==> ', requests);
  return {
    requests, // shortcut syntax for `comment: comment.observe()`
  };
});

const EnhancedRequstItem = enhancef(RequestItem);

const styles = StyleSheet.create({
  mainContainer: {
    display: 'flex',
    flex: 1,
    padding: scale(5),
    backgroundColor: config.color.background,
  },
  listRequest: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    height: scale(40),
    borderWidth: 1,
    borderRadius: 2,
    borderColor: config.color.gray,
    marginBottom: scale(5),
  },
  iconListRequest: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
    height: scale(40),
    maxHeight: scale(40),
  },
  descListRequest: {
    flex: 4,
    height: scale(40),
    maxHeight: scale(40),
    paddingLeft: scale(8),
    justifyContent: 'center',
  },
  timeListRequest: {
    flex: 1,
    height: scale(40),
    maxHeight: scale(40),
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingRight: scale(5),
    paddingBottom: scale(3),
  },
  time: {
    fontSize: config.fontSize.mini,
    color: config.color.common.gray,
  },
});

export default EnhancedComponent;


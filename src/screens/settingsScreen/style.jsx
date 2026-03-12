import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020B1B',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    marginBottom: 25,
  },

  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
  },

  headerSub: {
    fontSize: 12,
    color: '#6B7C99',
    marginTop: 3,
  },

  section: {
    color: '#6B7C99',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    fontSize: 12,
    letterSpacing: 1,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#0E1A33',
  },

  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  rowText: {
    flex: 1,
  },

  title: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },

  subtitle: {
    color: '#6B7C99',
    fontSize: 12,
    marginTop: 3,
  },

  status: {
    color: '#00E0A4',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default styles;

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { CacheSubject } from '../lib/CacheSubject';


describe('CacheSubject', function() {
  it('should extend Subject', function() {
    const subject = new CacheSubject(null);
    expect(subject instanceof Subject).toBe(true);
  });

  it('should start with an initialization value', function(done) {
    const subject = new CacheSubject('foo');
    const expected = ['foo', 'bar'];
    let i = 0;

    subject.subscribe((x: string) => {
      expect(x).toEqual(expected[i++]);
    }, null, done);

    subject.next('bar');
    subject.complete();
  });

  it('should pump values to multiple subscribers', function(done) {
    const subject = new CacheSubject('init');
    const expected = ['init', 'foo', 'bar'];
    let i = 0;
    let j = 0;

    subject.subscribe((x: string) => {
      expect(x).toEqual(expected[i++]);
    });

    subject.subscribe((x: string) => {
      expect(x).toEqual(expected[j++]);
    }, null, done);

    expect(subject.observers.length).toEqual(2);
    subject.next('foo');
    subject.next('bar');
    subject.complete();
  });

  it('should ignore new values after a complete', function(done) {
    const subject = new CacheSubject('init');
    const expected = ['init', 'foo'];
    const log = [];

    subject.subscribe((x: string) => {
      log.push(x);
    }, null, done);

    expect(log).toEqual(['init']);

    subject.next('foo');
    expect(log).toEqual(['init', 'foo']);

    subject.complete();
    expect(log).toEqual(['init', 'foo']);

    subject.next('bar');
    expect(log).toEqual(['init', 'foo']);
  });

  it('should clean out unsubscribed subscribers', function(done) {
    const subject = new CacheSubject('init');

    const sub1 = subject.subscribe((x: string) => {
      expect(x).toEqual('init');
    });

    const sub2 = subject.subscribe((x: string) => {
      expect(x).toEqual('init');
    });

    expect(subject.observers.length).toEqual(2);
    sub1.unsubscribe();
    expect(subject.observers.length).toEqual(1);
    sub2.unsubscribe();
    expect(subject.observers.length).toEqual(0);
    done();
  });

  it('should be an Observer which can be given to Observable.subscribe', function(done) {
    const source = Observable.of(1, 2, 3, 4, 5);
    const subject = new CacheSubject(0);
    const expected = [0, 1, 2, 3, 4, 5];

    subject.subscribe(
      (x: number) => {
        expect(x).toEqual(expected.shift());
      }, (x) => {
        done(new Error('should not be called'));
      }, () => {
        done();
      });

    source.subscribe(subject);
  });
});
